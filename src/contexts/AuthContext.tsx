import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../lib/types';
import type { UserRecord } from '../lib/db';
import { dbPromise } from '../lib/db';
import {
    generateSalt, deriveKey, generateDataKey, encryptDEK, decryptDEK, hashPassword
} from '../lib/crypto';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
    user: User | null;
    dek: CryptoKey | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => void;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [dek, setDek] = useState<CryptoKey | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Maybe verify session? No peristent session
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if any user exists? Or just stop loading.
        // Since we don't persist session across reload (security), we just set loading to false.
        setIsLoading(false);
    }, []);

    const register = async (username: string, password: string) => {
        try {
            setError(null);
            setIsLoading(true);
            const db = await dbPromise;
            const existing = await db.getFromIndex('users', 'by-username', username);
            if (existing) {
                throw new Error('Username already exists');
            }

            const salt = await generateSalt();
            const passwordHash = await hashPassword(password, salt);
            const kek = await deriveKey(password, salt);
            const newDek = await generateDataKey();
            const encryptedDek = await encryptDEK(newDek, kek);

            const userId = uuidv4();
            const now = new Date().toISOString();
            const newUserRecord: UserRecord = {
                id: userId,
                username,
                salt,
                passwordHash,
                encryptedDek,
                createdAt: now,
                updatedAt: now
            };

            await db.add('users', newUserRecord);

            // Auto login
            const userObj: User = { ...newUserRecord };
            setUser(userObj);
            setDek(newDek);
        } catch (e: any) {
            setError(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string) => {
        try {
            setError(null);
            setIsLoading(true);
            const db = await dbPromise;
            const userRecord = await db.getFromIndex('users', 'by-username', username);

            if (!userRecord) {
                throw new Error('Invalid username or password');
            }

            const hash = await hashPassword(password, userRecord.salt);
            if (hash !== userRecord.passwordHash) {
                throw new Error('Invalid username or password');
            }

            const kek = await deriveKey(password, userRecord.salt);
            const decryptedDek = await decryptDEK(userRecord.encryptedDek, kek);

            setUser(userRecord);
            setDek(decryptedDek);
        } catch (e: any) {
            setError(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setDek(null);
    };

    return (
        <AuthContext.Provider value={{
            user, dek, isAuthenticated: !!user, isLoading, login, register, logout, error
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
