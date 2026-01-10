export type BaseEntity = {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
};

export type Item = BaseEntity & {
    name: string;
    sku: string;
    barcode?: string;
    description?: string;
    categoryId: string;
    locationId: string;
    quantity: number;
    minQuantity: number;
    unit: string;
    costPrice: number;
    sellingPrice: number;
    images: string[];
    customFields: Record<string, any>;
};

export type Category = BaseEntity & {
    name: string;
    parentId?: string | null;
    description?: string;
};

export type Location = BaseEntity & {
    name: string;
    parentId?: string | null;
    description?: string;
    address?: string;
};

export type TransactionType = 'add' | 'remove' | 'adjust' | 'transfer';

export type Transaction = BaseEntity & {
    itemId: string;
    type: TransactionType;
    quantity: number;
    fromLocationId?: string;
    toLocationId?: string;
    reason?: string;
    notes?: string;
    userId: string;
};

export type Alert = BaseEntity & {
    itemId: string;
    type: 'low_stock';
    message: string;
    isRead: boolean;
};

export type User = BaseEntity & {
    username: string;
    salt: string;        // Base64
    passwordHash: string; // Base64, for verification
    encryptedDek: string; // Base64, DEK encrypted with KEK
};
