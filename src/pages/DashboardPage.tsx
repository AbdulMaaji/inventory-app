import { useData } from '../contexts/DataContext';
import { ArrowUpRight, ArrowDownRight, Package, AlertTriangle, DollarSign } from 'lucide-react';

// Inline Card for now if not created, or I create it first? 
// I'll assume I'll create `src/components/ui/Card.tsx` next.

export default function DashboardPage() {
    const { items, transactions } = useData();

    const totalItems = items.length;
    const lowStockCount = items.filter(i => i.quantity <= i.minQuantity).length;
    // const totalValue = items.reduce((sum, i) => sum + (i.costPrice * i.quantity), 0);
    // Formatter
    const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    const totalValue = items.reduce((sum, i) => sum + (Number(i.costPrice) * i.quantity), 0);

    const recentTransactions = transactions.slice(0, 5);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total Items</h3>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{totalItems}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total Value</h3>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{currency.format(totalValue)}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Low Stock</h3>
                        <AlertTriangle className={lowStockCount > 0 ? "h-4 w-4 text-red-500" : "h-4 w-4 text-muted-foreground"} />
                    </div>
                    <div className="text-2xl font-bold">{lowStockCount}</div>
                    <p className="text-xs text-muted-foreground">Items below minimum</p>
                </div>
                {/* ... */}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 flex flex-row items-center justify-between">
                        <h3 className="font-semibold leading-none tracking-tight">Recent Transactions</h3>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="space-y-4">
                            {recentTransactions.length === 0 && <p className="text-sm text-muted-foreground">No transactions yet.</p>}
                            {recentTransactions.map(t => (
                                <div key={t.id} className="flex items-center">
                                    <div className={`mr-4 flex h-9 w-9 items-center justify-center rounded-full border ${t.type === 'add' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
                                        {t.type === 'add' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{t.type.toUpperCase()} - {items.find(i => i.id === t.itemId)?.name || 'Unknown Item'}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        {t.type === 'add' ? '+' : '-'}{t.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
