import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import {
    ArrowUpRight, ArrowDownRight, Package, AlertTriangle,
    DollarSign, Users, Activity as ActivityIcon, Clock,
    ShoppingCart, ChevronRight, TrendingUp, Power
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
    const { items, transactions, sales, activeShift, activities, alerts } = useData();
    const { user, shop } = useAuth();
    const navigate = useNavigate();

    const isOwner = user?.role === 'owner';

    const currency = new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'NGN',
        minimumFractionDigits: 0
    }).format;

    // Daily Stats
    const today = new Date().toISOString().split('T')[0];
    const todaysSales = sales.filter(s => s.timestamp.startsWith(today));
    const totalSalesAmount = todaysSales.reduce((sum, s) => sum + s.totalAmount, 0);

    // Performance
    const employeeStats = sales.reduce((acc, s) => {
        const username = activities.find(a => a.userId === s.userId)?.userSnapshot?.username || 'User';
        acc[username] = (acc[username] || 0) + s.totalAmount;
        return acc;
    }, {} as Record<string, number>);

    if (isOwner) {
        return (
            <div className="space-y-8 pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                            {shop?.name || 'Dashboard'}
                        </h1>
                        <p className="text-muted-foreground font-medium">Business Overview • Code: <span className="text-primary font-bold">{shop?.code}</span></p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate('/inventory')} className="rounded-xl border-2">
                            <Package className="mr-2 h-4 w-4" /> Inventory
                        </Button>
                        <Button onClick={() => navigate('/sales')} className="rounded-xl shadow-lg shadow-primary/20">
                            <ShoppingCart className="mr-2 h-4 w-4" /> View Sales
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card
                        title="Today's Sales"
                        value={currency(totalSalesAmount)}
                        icon={<DollarSign className="h-6 w-6 text-green-600" />}
                        trend={todaysSales.length > 0 ? `+${todaysSales.length} orders` : 'No orders yet'}
                        color="green"
                    />
                    <Card
                        title="Active Employees"
                        value={Object.keys(employeeStats).length.toString()}
                        icon={<Users className="h-6 w-6 text-blue-600" />}
                        trend="Online or Active"
                        color="blue"
                    />
                    <Card
                        title="Low Stock"
                        value={items.filter(i => i.quantity <= i.minQuantity).length.toString()}
                        icon={<AlertTriangle className="h-6 w-6 text-orange-500" />}
                        trend="Items to restock"
                        color="orange"
                    />
                    <Card
                        title="Large Alerts"
                        value={alerts.filter(a => !a.isRead && a.level === 'high').length.toString()}
                        icon={<ActivityIcon className="h-6 w-6 text-red-500" />}
                        trend="Needs attention"
                        color="red"
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <div className="col-span-1 md:col-span-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ActivityIcon className="h-5 w-5 text-primary" /> Live Activity Feed
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/activities')}>View All</Button>
                        </div>
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
                            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                {activities.slice(0, 6).map(act => (
                                    <div key={act.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                            {getActionIcon(act.action)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-baseline justify-between mb-0.5">
                                                <p className="text-sm font-bold">{act.userSnapshot.username}</p>
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                                                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{act.details}</p>
                                        </div>
                                    </div>
                                ))}
                                {activities.length === 0 && (
                                    <div className="p-10 text-center text-muted-foreground italic">No activities recorded in this shop yet.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-3 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-500" /> Top Contributors
                            </h2>
                        </div>
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                            <div className="space-y-6">
                                {Object.entries(employeeStats)
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 5)
                                    .map(([name, amount], idx) => (
                                        <div key={name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-primary/10 text-primary font-black">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{name}</p>
                                                    <p className="text-xs text-muted-foreground">Cashier</p>
                                                </div>
                                            </div>
                                            <p className="font-extrabold text-lg">{currency(amount)}</p>
                                        </div>
                                    ))
                                }
                                {Object.keys(employeeStats).length === 0 && (
                                    <div className="text-center text-muted-foreground py-10">No sales tracked yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // EMPLOYEE DASHBOARD
    return (
        <div className="space-y-8 pb-10">
            <div className="p-8 rounded-[32px] bg-primary relative overflow-hidden shadow-2xl shadow-primary/20">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black">Hello, {user?.fullName?.split(' ')[0] || user?.username}!</h1>
                        <p className="text-primary-foreground/80 font-medium">Ready for your shift at <span className="font-bold underlineDecoration decoration-white/30">{shop?.name}</span>?</p>
                    </div>

                    {!activeShift ? (
                        <Button
                            onClick={() => navigate('/shift')}
                            className="bg-white text-primary hover:bg-gray-100 h-14 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-black/10"
                        >
                            <Power className="mr-2 h-5 w-5" /> Start Your Shift
                        </Button>
                    ) : (
                        <div className="flex gap-3">
                            <Button
                                onClick={() => navigate('/pos')}
                                className="bg-white text-primary hover:bg-gray-100 h-14 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-black/10"
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" /> Make a Sale
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate('/shift')}
                                className="bg-primary/20 hover:bg-primary/30 border-white/20 text-white h-14 rounded-2xl"
                            >
                                <Clock className="mr-2 h-5 w-5" /> Shift Info
                            </Button>
                        </div>
                    )}
                </div>
                {/* Decorative blob */}
                <div className="absolute -top-20 -right-20 h-64 w-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 bg-black/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-2xl font-black px-2">Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <ActionCard label="New Sale" icon={<ShoppingCart />} onClick={() => navigate('/pos')} color="blue" disabled={!activeShift} />
                        <ActionCard label="Receive Stock" icon={<Package />} onClick={() => navigate('/receive')} color="green" />
                        <ActionCard label="Check Status" icon={<Clock />} onClick={() => navigate('/shift')} color="orange" />
                        <ActionCard label="Barcode" icon={<ActivityIcon />} onClick={() => navigate('/scan')} color="purple" />
                    </div>

                    <h2 className="text-2xl font-black px-2 mt-10">My Recent Sales</h2>
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="divide-y divide-gray-50 dark:divide-gray-800">
                            {sales.filter(s => s.userId === user?.id).slice(0, 5).map(s => (
                                <div key={s.id} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-green-100 text-green-700">
                                            <ShoppingCart className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold">{currency(s.totalAmount)}</p>
                                            <p className="text-xs text-muted-foreground uppercase">{s.paymentMethod} • {new Date(s.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-300" />
                                </div>
                            ))}
                            {sales.filter(s => s.userId === user?.id).length === 0 && (
                                <div className="p-10 text-center text-muted-foreground">You haven't made any sales today yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-black px-2">Performance</h2>
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 space-y-8">
                        <div>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Today's Total</p>
                            <p className="text-4xl font-black text-primary">{currency(todaysSales.filter(s => s.userId === user?.id).reduce((sum, s) => sum + s.totalAmount, 0))}</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground font-medium">Sales Count</span>
                                <span className="font-black">{todaysSales.filter(s => s.userId === user?.id).length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground font-medium">Estimated Comm.</span>
                                <span className="text-green-600 font-black">+{currency(todaysSales.filter(s => s.userId === user?.id).reduce((sum, s) => sum + s.totalAmount, 0) * (user?.commissionRate || 0.02) / 100)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground font-medium">Shift Status</span>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${activeShift ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {activeShift ? 'On Shift' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Card({ title, value, icon, trend, color }: any) {
    const colors = {
        green: 'bg-green-50 text-green-700 border-green-100',
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        orange: 'bg-orange-50 text-orange-700 border-orange-100',
        red: 'bg-red-50 text-red-700 border-red-100',
    } as any;

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-[32px] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${colors[color]}`}>
                    {icon}
                </div>
                <span className="text-xs font-bold text-muted-foreground">{trend}</span>
            </div>
            <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
                <p className="text-3xl font-black mt-1">{value}</p>
            </div>
        </div>
    );
}

function ActionCard({ label, icon, onClick, color, disabled }: any) {
    const colors = {
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
        green: 'text-green-600 bg-green-50 dark:bg-green-900/20',
        orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
        purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    } as any;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex flex-col items-center justify-center p-6 rounded-[32px] border transition-all hover:scale-105 active:scale-95 space-y-3 disabled:opacity-50 disabled:hover:scale-100 ${colors[color] || ''} border-transparent hover:border-current/10`}
        >
            <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white dark:bg-black/20 shadow-sm border border-current/10">
                {React.cloneElement(icon, { className: 'h-6 w-6' })}
            </div>
            <span className="font-black text-xs uppercase tracking-wider">{label}</span>
        </button>
    );
}

function getActionIcon(action: string) {
    switch (action) {
        case 'sale_created': return <ShoppingCart className="h-4 w-4 text-green-600" />;
        case 'stock_received': return <Package className="h-4 w-4 text-blue-600" />;
        case 'start_shift': return <Power className="h-4 w-4 text-purple-600" />;
        case 'end_shift': return <Power className="h-4 w-4 text-red-600" />;
        case 'login': return <Users className="h-4 w-4 text-gray-600" />;
        default: return <ActivityIcon className="h-4 w-4 text-primary" />;
    }
}
import React from 'react';
