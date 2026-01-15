import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import {
    Package, AlertTriangle,
    Users, Activity as ActivityIcon, Clock,
    ChevronRight, TrendingUp, Power
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
    const { items, sales, activeShift, shifts, activities, alerts } = useData();
    const { user, shop, employees } = useAuth();
    const navigate = useNavigate();
    const isOwner = user?.role === 'owner';

    const currency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NGN' }).format(val);

    if (isOwner) {
        return (
            <div className="space-y-8 pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Management Center</h1>
                        <p className="text-muted-foreground font-medium flex items-center gap-2">
                            Welcome back, <span className="text-primary font-bold">{user?.fullName || user?.username}</span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardCard
                        title="Today's Inventory Val"
                        value={currency(items.reduce((sum, i) => sum + (i.sellingPrice * i.quantity), 0))}
                        icon={<TrendingUp className="text-green-600" />}
                        trend={`${items.length} unique items logged`}
                    />
                    <DashboardCard
                        title="Low Stock Items"
                        value={items.filter(i => i.quantity <= i.minQuantity).length.toString()}
                        icon={<Package className="text-orange-600" />}
                        trend={`${items.filter(i => i.quantity === 0).length} completely out of stock`}
                        critical={items.some(i => i.quantity <= i.minQuantity)}
                    />
                    <DashboardCard
                        title="Total Staff"
                        value={employees.length.toString()}
                        icon={<Users className="text-blue-600" />}
                        trend={`${shifts.filter(s => s.status === 'open').length} staff active now`}
                    />
                    <DashboardCard
                        title="Alert Severity"
                        value={alerts.length.toString()}
                        icon={<AlertTriangle className="text-red-600" />}
                        trend={`${alerts.filter(a => a.level === 'high').length} high priority alerts`}
                        critical={alerts.some(a => a.level === 'high')}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black">Live Shop Activity</h2>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/activities')} className="text-xs font-bold text-primary">View Full Log</Button>
                        </div>
                        <div className="space-y-4">
                            {activities.slice(0, 5).map((act, index) => (
                                <div key={act.id || `activity-${index}`} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                                    <div className="p-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                        <ActivityIcon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate text-gray-800 dark:text-gray-200">{act.details}</p>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground opacity-70 tracking-tighter">
                                            {act.userSnapshot?.username || 'Unknown User'} • {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-300" />
                                </div>
                            ))}
                            {activities.length === 0 && <p className="text-center py-10 text-muted-foreground italic">No recent activity found.</p>}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                        <h2 className="text-2xl font-black italic">Profitability</h2>
                        <div className="space-y-8">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Inventory Value</p>
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                </div>
                                <p className="text-3xl font-black">{currency(items.reduce((sum, i) => sum + (i.sellingPrice * i.quantity), 0))}</p>
                            </div>
                            <div className="pt-6 border-t border-gray-50 dark:border-gray-800">
                                <p className="text-xs font-black uppercase text-muted-foreground mb-4 tracking-widest">Performance Insights</p>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">Avg Transaction</span>
                                        <span className="font-black text-primary">{currency(sales.length ? (sales.reduce((sum, s) => sum + s.totalAmount, 0) / sales.length) : 0)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">Top Staff</span>
                                        <span className="font-black">N/A</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black">Staff Dashboard</h1>
                    <p className="text-muted-foreground font-medium italic">Operations Portal • {shop?.name}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-2xl">
                    <div className={`h-2 w-2 rounded-full ${activeShift ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{activeShift ? 'SHIFT ACTIVE' : 'NO ACTIVE SHIFT'}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h2 className="text-xl font-black px-2">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <ActionButton
                            onClick={() => navigate('/items')}
                            label="Inventory"
                            icon={<Package />}
                        />
                        <ActionButton
                            onClick={() => navigate('/shift')}
                            label={activeShift ? "End Shift" : "Start Shift"}
                            icon={<Power />}
                            variant={activeShift ? "danger" : "primary"}
                        />
                        <ActionButton
                            onClick={() => navigate('/activities')}
                            label="Recent Logs"
                            icon={<ActivityIcon />}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-black px-2">Shift Status</h2>
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center justify-center space-y-4 min-h-[200px]">
                        {activeShift ? (
                            <>
                                <div className="h-16 w-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                    <Clock className="h-8 w-8 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Shift Started At</p>
                                    <p className="text-2xl font-black">{new Date(activeShift.startTime).toLocaleTimeString()}</p>
                                </div>
                                <div className="pt-4 border-t w-full">
                                    <p className="text-xs font-bold text-muted-foreground mb-1 italic">Total Sales Recorded</p>
                                    <p className="text-xl font-black text-primary">{currency(sales.filter(s => s.shiftId === activeShift.id).reduce((sum, s) => sum + s.totalAmount, 0))}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="h-16 w-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center opacity-50">
                                    <Power className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-muted-foreground font-medium italic">You are currently clocked out.<br />Please start a shift to begin sales.</p>
                                <Button onClick={() => navigate('/shift')} className="mt-4 rounded-xl font-black uppercase text-xs tracking-widest px-8">Start Now</Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DashboardCard({ title, value, icon, trend, critical }: any) {
    return (
        <div className={`bg-white dark:bg-gray-900 rounded-[32px] p-6 border-2 shadow-sm transition-all hover:scale-[1.02] ${critical ? 'border-red-100 dark:border-red-900/30 bg-red-50/10' : 'border-gray-50 dark:border-gray-800 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">{icon}</div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${critical ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-muted-foreground'}`}>
                    {critical ? 'Urgent' : 'Current'}
                </span>
            </div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-70">{title}</p>
            <p className="text-2xl font-black tracking-tight">{value}</p>
            <p className="text-[10px] font-bold text-muted-foreground mt-2 opacity-60 italic">{trend}</p>
        </div>
    );
}

function ActionButton({ label, icon, onClick, variant = 'primary', disabled }: any) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[28px] border-2 transition-all group lg:aspect-video ${disabled ? 'opacity-30 cursor-not-allowed bg-gray-50' : variant === 'danger' ? 'bg-red-50/30 border-red-100 hover:bg-red-50 hover:border-red-200' : 'bg-white dark:bg-gray-900 border-gray-50 dark:border-gray-800 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5'}`}
        >
            <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                {React.cloneElement(icon, { className: 'h-6 w-6' })}
            </div>
            <span className={`text-xs font-black uppercase tracking-widest ${variant === 'danger' ? 'text-red-700' : 'text-gray-900 dark:text-gray-100'}`}>{label}</span>
        </button>
    );
}

import React from 'react';
