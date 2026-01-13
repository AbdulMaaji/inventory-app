import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
    Users, UserPlus,
    ChevronRight, TrendingUp, DollarSign
} from 'lucide-react';
import type { UserRole } from '../lib/types';

export default function EmployeesPage() {
    const { createEmployee, employees } = useAuth();
    const { sales, activities } = useData();
    const [showAdd, setShowAdd] = useState(false);

    // Form state
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('cashier');
    const [loading, setLoading] = useState(false);

    const staff = employees.filter(e => e.role !== 'owner');



    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createEmployee({
                fullName, username, phone, password, role
            });
            alert(`Employee ${fullName} created successfully!`);
            setShowAdd(false);
            setFullName(''); setUsername(''); setPhone(''); setPassword('');
        } catch (e: any) {
            alert(e.message);
        }
        setLoading(false);
    };

    const currency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NGN' }).format(val);

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Employee Management</h1>
                    <p className="text-muted-foreground font-medium">Manage your team and track performance</p>
                </div>
                <Button onClick={() => setShowAdd(true)} className="rounded-2xl h-12 px-6">
                    <UserPlus className="mr-2 h-5 w-5" /> Add Employee
                </Button>
            </div>

            {showAdd && (
                <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border-2 border-primary/20 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black">Register New Staff</h2>
                        <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                    </div>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Full Name</label>
                            <Input placeholder="Blessing Musa" value={fullName} onChange={e => setFullName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Phone Number</label>
                            <Input placeholder="080xxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Username (for login)</label>
                            <Input placeholder="blessing_m" value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Password</label>
                            <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Designated Role</label>
                            <select
                                value={role}
                                onChange={e => setRole(e.target.value as UserRole)}
                                className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-none font-medium text-sm focus:ring-2 focus:ring-primary"
                            >
                                <option value="cashier">Cashier</option>
                                <option value="manager">Manager</option>
                                <option value="stock_keeper">Stock Keeper</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 pt-4">
                            <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black" disabled={loading}>
                                {loading ? 'Creating...' : 'Register Employee'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-2xl font-black px-2">Staff Directory</h2>
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                        <div className="divide-y divide-gray-50 dark:divide-gray-800">
                            {staff.map(u => (
                                <div key={u.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            <Users className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-bold">{u.fullName || u.username}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">{u.role}</span>
                                                <span className="text-[10px] font-black uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Online</span>
                                                <span className="text-[10px] font-bold text-muted-foreground ml-2">Password: ••••••••</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Today's Sales</p>
                                            <p className="font-black">{currency(sales.filter(s => activities.find(a => a.userId === s.userId)?.userSnapshot?.username === u.username).reduce((sum, s) => sum + s.totalAmount, 0))}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-300" />
                                    </div>
                                </div>
                            ))}
                            {staff.length === 0 && <div className="p-10 text-center text-muted-foreground italic">No employees registered yet.</div>}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-black px-2 text-primary">Performance Insights</h2>
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 space-y-8 shadow-sm">
                        <div className="space-y-6">
                            <Stat label="Total Team Count" value={staff.length.toString()} icon={<Users />} />
                            <Stat label="Total Monthly Payroll" value={currency(0)} icon={<DollarSign />} />
                            <Stat label="Efficiency Rating" value="98%" icon={<TrendingUp />} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value, icon }: any) {
    return (
        <div className="flex items-center gap-4">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-muted-foreground">
                {React.cloneElement(icon, { className: 'h-5 w-5' })}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{label}</p>
                <p className="text-xl font-black">{value}</p>
            </div>
        </div>
    );
}
import React from 'react';
