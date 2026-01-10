import { openDB, type DBSchema } from 'idb';

export interface EncryptedRecord {
    id: string;
    encryptedData: string;
}

export interface UserRecord {
    id: string;
    username: string;
    salt: string;
    passwordHash: string;
    encryptedDek: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

interface InventoryDB extends DBSchema {
    items: {
        key: string; // uuid
        value: EncryptedRecord;
    };
    categories: {
        key: string;
        value: EncryptedRecord;
    };
    locations: {
        key: string;
        value: EncryptedRecord;
    };
    transactions: {
        key: string;
        value: EncryptedRecord;
    };
    alerts: {
        key: string;
        value: EncryptedRecord;
    };
    users: {
        key: string;
        value: UserRecord;
        indexes: { 'by-username': string };
    };
}

const DB_NAME = 'inventory_app';
const DB_VERSION = 1;

export async function initDB() {
    return openDB<InventoryDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('items')) {
                db.createObjectStore('items', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('categories')) {
                db.createObjectStore('categories', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('locations')) {
                db.createObjectStore('locations', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('transactions')) {
                db.createObjectStore('transactions', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('alerts')) {
                db.createObjectStore('alerts', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('users')) {
                const userStore = db.createObjectStore('users', { keyPath: 'id' });
                userStore.createIndex('by-username', 'username', { unique: true });
            }
        },
    });
}

export const dbPromise = initDB();
