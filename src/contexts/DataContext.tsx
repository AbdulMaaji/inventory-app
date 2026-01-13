import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import type { Item, Category, Transaction, Alert, Shift, Sale, Activity, ShiftRequest, LeaveRequest } from '../lib/types';
import { dbPromise, type EncryptedRecord } from '../lib/db';
import { encryptData, decryptData } from '../lib/crypto';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface DataContextType {
    items: Item[];
    categories: Category[];
    transactions: Transaction[];
    alerts: Alert[];
    shifts: Shift[];
    sales: Sale[];
    activities: Activity[];
    shiftRequests: ShiftRequest[];
    leaveRequests: LeaveRequest[];
    isLoading: boolean;
    refreshData: () => Promise<void>;

    addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'shopId'>) => Promise<void>;
    updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;

    addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'shopId'>) => Promise<void>;
    updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;

    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'shopId'>) => Promise<void>;

    // Shifts & Leave
    startShift: (openingCash: number) => Promise<void>;
    endShift: (closingCash: number, notes?: string) => Promise<void>;
    activeShift: Shift | null;
    requestShift: (data: Omit<ShiftRequest, 'id' | 'createdAt' | 'updatedAt' | 'shopId' | 'userId' | 'status'>) => Promise<void>;
    requestLeave: (data: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt' | 'shopId' | 'userId' | 'status'>) => Promise<void>;
    updateShiftRequest: (id: string, status: ShiftRequest['status']) => Promise<void>;
    updateLeaveRequest: (id: string, status: LeaveRequest['status']) => Promise<void>;
    receiveStock: (data: { itemId: string; quantity: number; costPrice: number; supplier?: string; invoice?: string }) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const { dek, isAuthenticated, user, shop, logActivity } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [shiftRequests, setShiftRequests] = useState<ShiftRequest[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const activeShift = shifts.find(s => s.status === 'open' && s.userId === user?.id) || null;

    const loadData = useCallback(async () => {
        if (!isAuthenticated || !dek || !user || !shop) return;
        setIsLoading(true);
        try {
            const db = await dbPromise;

            const decryptAll = async <T,>(storeName: 'items' | 'categories' | 'transactions' | 'alerts' | 'shifts' | 'sales' | 'activities' | 'shift_requests' | 'leave_requests') => {
                const records = await db.getAllFromIndex(storeName, 'by-shop', shop.id);
                const decrypted = await Promise.all(
                    records.map(async (r: EncryptedRecord) => {
                        try {
                            return await decryptData(r.encryptedData, dek);
                        } catch (e) {
                            return null;
                        }
                    })
                );
                return decrypted.filter((x): x is T => x !== null);
            };

            const [
                loadedItems, loadedCats, loadedTrans,
                loadedAlerts, loadedShifts, loadedSales, loadedActs,
                loadedShiftReqs, loadedLeaveReqs
            ] = await Promise.all([
                decryptAll<Item>('items'),
                decryptAll<Category>('categories'),
                decryptAll<Transaction>('transactions'),
                decryptAll<Alert>('alerts'),
                decryptAll<Shift>('shifts'),
                decryptAll<Sale>('sales'),
                decryptAll<Activity>('activities'),
                decryptAll<ShiftRequest>('shift_requests'),
                decryptAll<LeaveRequest>('leave_requests')
            ]);

            setItems(loadedItems);
            setCategories(loadedCats);
            setTransactions(loadedTrans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setAlerts(loadedAlerts);
            setShifts(loadedShifts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setSales(loadedSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setActivities(loadedActs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setShiftRequests(loadedShiftReqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setLeaveRequests(loadedLeaveReqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setIsLoading(false);
        }
    }, [dek, isAuthenticated, user, shop]);

    useEffect(() => {
        if (!isAuthenticated) {
            setItems([]);
            setCategories([]);
            setTransactions([]);
            setAlerts([]);
            setShifts([]);
            setSales([]);
            setActivities([]);
        } else {
            loadData();
        }
    }, [isAuthenticated, loadData]);

    const saveRecord = async (storeName: any, data: any) => {
        if (!dek || !shop) throw new Error("No encryption key or shop");
        const encrypted = await encryptData(JSON.stringify(data), dek);
        const db = await dbPromise;
        await db.put(storeName, { id: data.id, shopId: shop.id, encryptedData: encrypted });
    };

    const addItem = async (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'shopId'>) => {
        if (!shop) return;
        const newItem: Item = {
            ...itemData,
            id: uuidv4(),
            shopId: shop.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setItems(prev => [...prev, newItem]);
        await saveRecord('items', newItem);
        await addTransaction({
            itemId: newItem.id,
            type: 'add',
            quantity: newItem.quantity,
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
        await updateItem(id, { deletedAt: new Date().toISOString() });
    };

    const addCategory = async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'shopId'>) => {
        if (!shop) return;
        const newCat: Category = {
            ...data,
            id: uuidv4(),
            shopId: shop.id,
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



    const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'shopId'>) => {
        if (!user || !shop) return;
        const newTrans: Transaction = {
            ...data,
            userId: user.id,
            userSnapshot: {
                username: user.username
            },
            shopId: shop.id,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setTransactions(prev => [newTrans, ...prev]);
        await saveRecord('transactions', newTrans);
    };

    const startShift = async (openingCash: number) => {
        if (!user || !shop) return;
        const newShift: Shift = {
            id: uuidv4(),
            shopId: shop.id,
            userId: user.id,
            startTime: new Date().toISOString(),
            openingCash,
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setShifts(prev => [newShift, ...prev]);
        await saveRecord('shifts', newShift);
        await logActivity('start_shift', `Started shift with ₦${openingCash}`);
    };

    const endShift = async (closingCash: number, notes?: string) => {
        if (!activeShift || !user) return;

        // Calculate expected variance (simplified: Sales + Opening)
        const shiftSales = sales.filter(s => s.shiftId === activeShift.id && s.paymentMethod === 'cash');
        const expectedCash = activeShift.openingCash + shiftSales.reduce((sum, s) => sum + s.totalAmount, 0);
        const variance = closingCash - expectedCash;

        const updatedShift: Shift = {
            ...activeShift,
            endTime: new Date().toISOString(),
            closingCash,
            variance,
            notes,
            status: 'closed',
            updatedAt: new Date().toISOString()
        };

        setShifts(prev => prev.map(s => s.id === updatedShift.id ? updatedShift : s));
        await saveRecord('shifts', updatedShift);
        await logActivity('end_shift', `Ended shift. Variance: ₦${variance}`);

        if (Math.abs(variance) > 1000) {
            // Create high priority alert
            const alert: Alert = {
                id: uuidv4(),
                shopId: shop!.id,
                itemId: '', // Not item specific
                type: 'variance_high',
                message: `High variance (₦${variance}) in ${user.username}'s shift.`,
                isRead: false,
                level: 'high',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            setAlerts(prev => [alert, ...prev]);
            await saveRecord('alerts', alert);
        }
    };

    const requestShift = async (data: Omit<ShiftRequest, 'id' | 'createdAt' | 'updatedAt' | 'shopId' | 'userId' | 'status'>) => {
        if (!user || !shop) return;
        const newReq: ShiftRequest = {
            ...data,
            id: uuidv4(),
            shopId: shop.id,
            userId: user.id,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setShiftRequests(prev => [newReq, ...prev]);
        await saveRecord('shift_requests', newReq);
        await logActivity('user_created', `Requested shift for ${data.date}`);
    };

    const requestLeave = async (data: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt' | 'shopId' | 'userId' | 'status'>) => {
        if (!user || !shop) return;
        const newReq: LeaveRequest = {
            ...data,
            id: uuidv4(),
            shopId: shop.id,
            userId: user.id,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setLeaveRequests(prev => [newReq, ...prev]);
        await saveRecord('leave_requests', newReq);
        await logActivity('user_created', `Requested leave from ${data.startDate} to ${data.endDate}`);
    };

    const updateShiftRequest = async (id: string, status: ShiftRequest['status']) => {
        setShiftRequests(prev => prev.map(r => {
            if (r.id === id) {
                const updated = { ...r, status, updatedAt: new Date().toISOString() };
                saveRecord('shift_requests', updated);
                return updated;
            }
            return r;
        }));
    };

    const updateLeaveRequest = async (id: string, status: LeaveRequest['status']) => {
        setLeaveRequests(prev => prev.map(r => {
            if (r.id === id) {
                const updated = { ...r, status, updatedAt: new Date().toISOString() };
                saveRecord('leave_requests', updated);
                return updated;
            }
            return r;
        }));
    };

    const receiveStock = async (data: { itemId: string; quantity: number; costPrice: number; supplier?: string; invoice?: string }) => {
        if (!user || !shop) return;

        const item = items.find(i => i.id === data.itemId);
        if (!item) return;

        await updateItem(item.id, {
            quantity: item.quantity + data.quantity,
            costPrice: data.costPrice
        });

        await addTransaction({
            itemId: item.id,
            type: 'stock_in',
            quantity: data.quantity,
            reason: `Restock - Inv: ${data.invoice || 'N/A'}`,
            notes: `Received from ${data.supplier || 'Unknown'}`
        });

        await logActivity('stock_received', `Received ${data.quantity} units of ${item.name}`);
    };

    return (
        <DataContext.Provider value={{
            items, categories, transactions, alerts, shifts, sales, activities, shiftRequests, leaveRequests, isLoading, refreshData: loadData,
            addItem, updateItem, deleteItem,
            addCategory, updateCategory, deleteCategory,
            addTransaction,
            startShift, endShift, activeShift, requestShift, requestLeave, updateShiftRequest, updateLeaveRequest, receiveStock
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
