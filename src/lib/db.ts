import { openDB, type DBSchema } from 'idb';
import type { UserRole } from './types';

export interface EncryptedRecord {
    id: string;
    shopId: string;
    encryptedData: string;
}

export interface UserRecord {
    id: string;
    shopId: string;
    username: string;
    phone?: string;
    fullName?: string;
    role: UserRole;
    salt: string;
    passwordHash: string;
    encryptedDek: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface ShopRecord {
    id: string;
    name: string;
    code: string; // Unique code like MAMANGOZI
    ownerId: string;
    location?: string;
    phone?: string;
    email?: string;
    createdAt: string;
    updatedAt: string;
}

interface InventoryDB extends DBSchema {
    shops: {
        key: string;
        value: ShopRecord;
        indexes: { 'by-code': string };
    };
    users: {
        key: string;
        value: UserRecord;
        indexes: { 'by-username': string; 'by-shop': string; 'by-phone': string };
    };
    // Encrypted stores
    items: {
        key: string;
        value: EncryptedRecord;
        indexes: { 'by-shop': string };
    };
    categories: {
        key: string;
        value: EncryptedRecord;
        indexes: { 'by-shop': string };
    };

    transactions: {
        key: string;
        value: EncryptedRecord;
        indexes: { 'by-shop': string };
    };
    alerts: {
        key: string;
        value: EncryptedRecord;
        indexes: { 'by-shop': string };
    };
    shifts: {
        key: string;
        value: EncryptedRecord;
        indexes: { 'by-shop': string };
    };
    sales: {
        key: string;
        value: EncryptedRecord;
        indexes: { 'by-shop': string };
    };
    activities: {
        key: string;
        value: EncryptedRecord;
        indexes: { 'by-shop': string };
    };
    shift_requests: {
        key: string;
        value: EncryptedRecord;
        indexes: { 'by-shop': string };
    };
    leave_requests: {
        key: string;
        value: EncryptedRecord;
        indexes: { 'by-shop': string };
    };
}

const DB_NAME = 'inventory_app';
const DB_VERSION = 4;

export async function initDB() {
    return openDB<InventoryDB>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, _newVersion, transaction) {
            // Shops
            if (!db.objectStoreNames.contains('shops')) {
                const shopStore = db.createObjectStore('shops', { keyPath: 'id' });
                shopStore.createIndex('by-code', 'code', { unique: true });
            } else if (oldVersion < 3) {
                const shopStore = transaction.objectStore('shops');
                if (!shopStore.indexNames.contains('by-code')) {
                    shopStore.createIndex('by-code', 'code', { unique: true });
                }
            }

            // Users
            if (!db.objectStoreNames.contains('users')) {
                const userStore = db.createObjectStore('users', { keyPath: 'id' });
                userStore.createIndex('by-username', 'username', { unique: false });
                userStore.createIndex('by-shop', 'shopId', { unique: false });
                userStore.createIndex('by-phone', 'phone', { unique: false });
            } else if (oldVersion < 3) {
                const userStore = transaction.objectStore('users');
                if (!userStore.indexNames.contains('by-phone')) {
                    userStore.createIndex('by-phone', 'phone', { unique: false });
                }
            }

            // Encrypted Stores
            const stores = [
                'items', 'categories', 'transactions',
                'alerts', 'shifts', 'sales', 'activities',
                'shift_requests', 'leave_requests'
            ] as const;

            for (const storeName of stores) {
                if (!db.objectStoreNames.contains(storeName)) {
                    const store = db.createObjectStore(storeName, { keyPath: 'id' });
                    store.createIndex('by-shop', 'shopId', { unique: false });
                } else {
                    const store = transaction.objectStore(storeName);
                    if (!store.indexNames.contains('by-shop')) {
                        store.createIndex('by-shop', 'shopId', { unique: false });
                    }
                }
            }
        },
    });
}

export const dbPromise = initDB();
