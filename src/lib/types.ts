export type BaseEntity = {
    id: string;
    shopId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
};

export type Shop = {
    id: string;
    name: string;
    code: string; // Unique shop code (e.g. MAMANGOZI)
    ownerId: string;
    location?: string;
    phone?: string;
    email?: string;
    createdAt: string;
    updatedAt: string;
};

export type UserRole = 'owner' | 'manager' | 'cashier' | 'stock_keeper';

export type User = BaseEntity & {
    username: string; // Used for unique login within shop or global? 
    // Summary says Login with Shop Code + Phone + Password.
    // I'll keep username/phone flexibility.
    phone?: string;
    fullName?: string;
    role: UserRole;
    salary?: number;
    commissionRate?: number;
    salt: string;        // Base64
    passwordHash: string; // Base64
    encryptedDek: string; // Base64
};

export type Item = BaseEntity & {
    name: string;
    sku: string;
    barcode?: string;
    description?: string;
    categoryId: string;
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



export type TransactionType = 'add' | 'remove' | 'adjust' | 'transfer' | 'sale' | 'stock_in';

export type Transaction = BaseEntity & {
    itemId: string;
    type: TransactionType;
    quantity: number;
    reason?: string;
    notes?: string;
    userId: string;
    userSnapshot?: {
        username: string;
    };
};

export type Shift = BaseEntity & {
    userId: string;
    startTime: string;
    endTime?: string;
    openingCash: number;
    closingCash?: number;
    variance?: number;
    notes?: string;
    status: 'open' | 'closed';
};

export type Sale = BaseEntity & {
    userId: string;
    shiftId: string;
    totalAmount: number;
    paymentMethod: 'cash' | 'transfer' | 'pos';
    timestamp: string;
    items: SaleItem[];
};

export type SaleItem = {
    id: string;
    saleId: string;
    itemId: string;
    quantity: number;
    priceAtSale: number;
    costAtSale: number;
};

export type ActivityAction =
    | 'login' | 'logout' | 'start_shift' | 'end_shift'
    | 'sale_created' | 'sale_voided' | 'stock_received'
    | 'stock_adjusted' | 'price_changed' | 'user_created';

export type Activity = BaseEntity & {
    userId: string;
    action: ActivityAction;
    details: string;
    timestamp: string;
    deviceInfo?: string;
    userSnapshot: {
        username: string;
        role: UserRole;
    };
};

export type Alert = BaseEntity & {
    itemId: string;
    type: 'low_stock' | 'variance_high' | 'large_sale';
    message: string;
    isRead: boolean;
    level: 'low' | 'medium' | 'high';
};

export type ShiftRequestStatus = 'pending' | 'approved' | 'rejected';

export type ShiftRequest = BaseEntity & {
    userId: string;
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
    status: ShiftRequestStatus;
};

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';

export type LeaveRequest = BaseEntity & {
    userId: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: LeaveRequestStatus;
};
