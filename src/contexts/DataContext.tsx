import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Item, Category, Location, Transaction, Alert, TransactionType } from '../lib/types';
import { dbPromise, type EncryptedRecord } from '../lib/db';
import { encryptData, decryptData } from '../lib/crypto';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface DataContextType {
    items: Item[];
    categories: Category[];
    locations: Location[];
    transactions: Transaction[];
    alerts: Alert[];
    isLoading: boolean;
    refreshData: () => Promise<void>;

    addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;

    addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;

    addLocation: (location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateLocation: (id: string, updates: Partial<Location>) => Promise<void>;
    deleteLocation: (id: string) => Promise<void>;

    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const { dek, isAuthenticated, user } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadData = useCallback(async () => {
        if (!isAuthenticated || !dek) return;
        setIsLoading(true);
        try {
            const db = await dbPromise;

            const decryptAll = async <T,>(storeName: any) => {
                const records = await db.getAll(storeName);
                const decrypted = await Promise.all(
                    records.map(async (r: EncryptedRecord) => {
                        try {
                            return await decryptData(r.encryptedData, dek);
                        } catch (e) {
                            console.error(`Failed to decrypt record in ${storeName}`, r.id);
                            return null;
                        }
                    })
                );
                return decrypted.filter((x): x is T => x !== null);
            };

            const [loadedItems, loadedCats, loadedLocs, loadedTrans, loadedAlerts] = await Promise.all([
                decryptAll<Item>('items'),
                decryptAll<Category>('categories'),
                decryptAll<Location>('locations'),
                decryptAll<Transaction>('transactions'),
                decryptAll<Alert>('alerts'),
            ]);

            setItems(loadedItems);
            setCategories(loadedCats);
            setLocations(loadedLocs);
            setTransactions(loadedTrans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setAlerts(loadedAlerts);

        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setIsLoading(false);
        }
    }, [dek, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) {
            setItems([]);
            setCategories([]);
            setLocations([]);
            setTransactions([]);
            setAlerts([]);
        } else {
            loadData();
        }
    }, [isAuthenticated, loadData]);

    // --- Helpers to save ---

    const saveRecord = async (storeName: any, data: any) => {
        if (!dek) throw new Error("No encryption key");
        const encrypted = await encryptData(data, dek);
        const db = await dbPromise;
        await db.put(storeName, { id: data.id, encryptedData: encrypted });
    };

    const deleteRecord = async (storeName: any, id: string) => {
        const db = await dbPromise;
        await db.delete(storeName, id);
    };

    // --- Actions ---

    const addItem = async (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newItem: Item = {
            ...itemData,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setItems(prev => [...prev, newItem]);
        await saveRecord('items', newItem);

        // Log creation transaction
        await addTransaction({
            itemId: newItem.id,
            type: 'add',
            quantity: newItem.quantity,
            toLocationId: newItem.locationId,
            reason: 'Initial creation',
            notes: 'Created item'
        });
    };

    const updateItem = async (id: string, updates: Partial<Item>) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
                saveRecord('items', updated);
                return updated;
            }
            return item;
        }));
    };

    const deleteItem = async (id: string) => {
        // Soft delete? Requirements say "soft deletes (deleted_at)"
        // So updateItem(id, { deletedAt: new Date().toISOString() })
        // But deleteRecord usually removes from DB.
        // I will implement soft delete as an update.
        await updateItem(id, { deletedAt: new Date().toISOString() });
    };

    const addCategory = async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newCat: Category = {
            ...data,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setCategories(prev => [...prev, newCat]);
        await saveRecord('categories', newCat);
    };

    const updateCategory = async (id: string, updates: Partial<Category>) => {
        setCategories(prev => prev.map(c => {
            if (c.id === id) {
                const updated = { ...c, ...updates, updatedAt: new Date().toISOString() };
                saveRecord('categories', updated);
                return updated;
            }
            return c;
        }));
    };

    const deleteCategory = async (id: string) => {
        await updateCategory(id, { deletedAt: new Date().toISOString() });
    };

    const addLocation = async (data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newLoc: Location = {
            ...data,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setLocations(prev => [...prev, newLoc]);
        await saveRecord('locations', newLoc);
    };

    const updateLocation = async (id: string, updates: Partial<Location>) => {
        setLocations(prev => prev.map(l => {
            if (l.id === id) {
                const updated = { ...l, ...updates, updatedAt: new Date().toISOString() };
                saveRecord('locations', updated);
                return updated;
            }
            return l;
        }));
    };

    const deleteLocation = async (id: string) => {
        await updateLocation(id, { deletedAt: new Date().toISOString() });
    };

    const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
        if (!user) return;
        const newTrans: Transaction = {
            ...data,
            userId: user.id,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setTransactions(prev => [newTrans, ...prev]);
        await saveRecord('transactions', newTrans);
    };

    return (
        <DataContext.Provider value={{
            items, categories, locations, transactions, alerts, isLoading, refreshData: loadData,
            addItem, updateItem, deleteItem,
            addCategory, updateCategory, deleteCategory,
            addLocation, updateLocation, deleteLocation,
            addTransaction
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
