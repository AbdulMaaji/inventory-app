import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Shop, UserRole, Activity } from '../lib/types';
import type { UserRecord, ShopRecord } from '../lib/db';
import { dbPromise } from '../lib/db';
import {
    generateSalt, deriveKey, generateDataKey, encryptDEK, decryptDEK, hashPassword, encryptData
} from '../lib/crypto';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
    user: User | null;
    shop: Shop | null;
    dek: CryptoKey | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (shopCode: string, identifier: string, password: string) => Promise<void>;
    registerShop: (data: { name: string; ownerName: string; password: string; location?: string; phone?: string; email?: string }) => Promise<string>;
    createEmployee: (data: { username: string; password: string; role: UserRole; fullName: string; phone?: string }) => Promise<void>;
    logout: () => void;
    error: string | null;
    logActivity: (action: Activity['action'], details: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [shop, setShop] = useState<Shop | null>(null);
    const [dek, setDek] = useState<CryptoKey | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Hydrate from session or similar if needed. 
        // For now, persistent auth is not implemented, just state.
        setIsLoading(false);
    }, []);

    const logActivity = async (action: Activity['action'], details: string) => {
        if (!user || !shop || !dek) return;

        try {
            const db = await dbPromise;
            const now = new Date().toISOString();
            const activity: Activity = {
                id: uuidv4(),
                shopId: shop.id,
                userId: user.id,
                action,
                details,
                timestamp: now,
                userSnapshot: {
                    username: user.username,
                    role: user.role
                },
                createdAt: now,
                updatedAt: now
            };

            const encryptedData = await encryptData(JSON.stringify(activity), dek);
            await db.add('activities', {
                id: activity.id,
                shopId: shop.id,
                encryptedData
            });
        } catch (e) {
            console.error("Failed to log activity:", e);
        }
    };

    const registerShop = async (data: { name: string; ownerName: string; password: string; location?: string; phone?: string; email?: string }) => {
        try {
            setError(null);
            setIsLoading(true);
            const db = await dbPromise;

            // Generate unique shop code (e.g. MAMA-NGOZI-123 or just uppercase of name parts)
            const cleanName = data.name.toUpperCase().replace(/[^A-Z0-9]/g, '');
            let shopCode = cleanName.slice(0, 10);

            // Check if code exists, if so append random
            const existingShop = await db.getFromIndex('shops', 'by-code', shopCode);
            if (existingShop) {
                shopCode = `${shopCode}${Math.floor(Math.random() * 999)}`;
            }

            const salt = await generateSalt();
            const passwordHash = await hashPassword(data.password, salt);
            const kek = await deriveKey(data.password, salt);
            const newDek = await generateDataKey();
            const encryptedDek = await encryptDEK(newDek, kek);

            const userId = uuidv4();
            const shopId = uuidv4();
            const now = new Date().toISOString();

            const newShop: ShopRecord = {
                id: shopId,
                name: data.name,
                code: shopCode,
                ownerId: userId,
                location: data.location,
                phone: data.phone,
                email: data.email,
                createdAt: now,
                updatedAt: now
            };

            const newUserRecord: UserRecord = {
                id: userId,
                shopId: shopId,
                username: data.ownerName.toLowerCase().replace(/\s/g, '_'),
                fullName: data.ownerName,
                phone: data.phone,
                role: 'owner',
                salt,
                passwordHash,
                encryptedDek,
                createdAt: now,
                updatedAt: now
            };

            const tx = db.transaction(['shops', 'users'], 'readwrite');
            await tx.objectStore('shops').add(newShop);
            await tx.objectStore('users').add(newUserRecord);
            await tx.done;

            // Log activity after state is set? We don't have state yet.
            // But we can set it and then log.
            setUser(newUserRecord);
            setShop(newShop);
            setDek(newDek);

            // Return the shop code so it can be shown to owner
            return shopCode;
        } catch (e: any) {
            setError(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (shopCode: string, identifier: string, password: string) => {
        try {
            setError(null);
            setIsLoading(true);
            const db = await dbPromise;

            // 1. Find shop by code
            const shopRecord = await db.getFromIndex('shops', 'by-code', shopCode.toUpperCase());
            if (!shopRecord) {
                throw new Error('Invalid Shop Code');
            }

            // 2. Find user in that shop by username or phone
            const users = await db.getAllFromIndex('users', 'by-shop', shopRecord.id);
            const userRecord = users.find(u =>
                u.username === identifier.toLowerCase() ||
                u.phone === identifier
            );

            if (!userRecord) {
                throw new Error('Invalid credentials for this shop');
            }

            // 3. Verify password
            const hash = await hashPassword(password, userRecord.salt);
            if (hash !== userRecord.passwordHash) {
                throw new Error('Invalid password');
            }

            const kek = await deriveKey(password, userRecord.salt);
            const decryptedDek = await decryptDEK(userRecord.encryptedDek, kek);

            setUser(userRecord);
            setShop(shopRecord);
            setDek(decryptedDek);

            // Log successful login
            // We'll call logActivity after the next tick to ensure state is flushed
            setTimeout(() => logActivity('login', `User ${userRecord.username} logged in from ${navigator.userAgent}`), 0);

        } catch (e: any) {
            setError(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const createEmployee = async (data: { username: string; password: string; role: UserRole; fullName: string; phone?: string }) => {
        if (!user || user.role !== 'owner') {
            throw new Error('Only owners can create employees');
        }

        try {
            setError(null);
            setIsLoading(true);
            const db = await dbPromise;

            // Check if username/phone exists IN THIS SHOP
            const users = await db.getAllFromIndex('users', 'by-shop', user.shopId);
            if (users.some(u => u.username === data.username.toLowerCase() || (data.phone && u.phone === data.phone))) {
                throw new Error('Username or phone already registered in this shop');
            }

            if (!dek) throw new Error('System error: DEK not available');

            const salt = await generateSalt();
            const passwordHash = await hashPassword(data.password, salt);
            const kek = await deriveKey(data.password, salt);
            const encryptedDek = await encryptDEK(dek, kek);

            const userId = uuidv4();
            const now = new Date().toISOString();

            const newUserRecord: UserRecord = {
                id: userId,
                shopId: user.shopId,
                username: data.username.toLowerCase(),
                fullName: data.fullName,
                phone: data.phone,
                role: data.role,
                salt,
                passwordHash,
                encryptedDek,
                createdAt: now,
                updatedAt: now
            };

            await db.add('users', newUserRecord);
            await logActivity('user_created', `Employee ${data.fullName} created as ${data.role}`);

        } catch (e: any) {
            setError(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        if (user && shop) {
            logActivity('logout', `User ${user.username} logged out`);
        }
        setUser(null);
        setShop(null);
        setDek(null);
    };

    return (
        <AuthContext.Provider value={{
            user, shop, dek, isAuthenticated: !!user, isLoading, login, registerShop, createEmployee, logout, error, logActivity
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
