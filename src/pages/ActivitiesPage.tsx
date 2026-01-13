import { useData } from '../contexts/DataContext';
import {
    Package, Power, Users, Activity as ActivityIcon,
    Smartphone, Monitor, Laptop, Search, Clock
} from 'lucide-react';
import { useState } from 'react';
import { Input } from '../components/ui/Input';

export default function ActivitiesPage() {
    const { activities } = useData();
    const [search, setSearch] = useState('');

    const filtered = activities.filter(a =>
        a.userSnapshot.username.toLowerCase().includes(search.toLowerCase()) ||
        a.details.toLowerCase().includes(search.toLowerCase()) ||
        a.action.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Shop Activity Log</h1>
                    <p className="text-muted-foreground font-medium">Complete audit trail of all actions in the shop</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter activities..."
                        className="pl-10 h-10 rounded-xl"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] overflow-hidden shadow-sm">
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {filtered.map(act => (
                        <div key={act.id} className="p-6 flex items-start gap-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="mt-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                                {getActionIcon(act.action)}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <p className="font-black text-lg">{act.userSnapshot.username}</p>
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full">
                                            {act.userSnapshot.role}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                                            <Clock className="h-3.5 w-3.5" />
                                            {formatTimestamp(act.timestamp)}
                                        </div>
                                        <div className="p-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            {getDeviceIcon(act.deviceInfo)}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 font-medium">{act.details}</p>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="p-20 text-center text-muted-foreground italic">No activities found matching your criteria.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getActionIcon(action: string) {
    switch (action) {
        case 'sale_created': return <ActivityIcon className="h-6 w-6 text-green-600" />;
        case 'stock_received': return <Package className="h-6 w-6 text-blue-600" />;
        case 'start_shift': return <Power className="h-6 w-6 text-purple-600" />;
        case 'end_shift': return <Power className="h-6 w-6 text-red-600" />;
        case 'login': return <Users className="h-6 w-6 text-gray-600" />;
        case 'price_changed': return <ActivityIcon className="h-6 w-6 text-orange-600" />;
        default: return <ActivityIcon className="h-6 w-6 text-primary" />;
    }
}

function getDeviceIcon(info?: string) {
    if (!info) return <Monitor className="h-3.5 w-3.5" />;
    const lower = info.toLowerCase();
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) return <Smartphone className="h-3.5 w-3.5" />;
    if (lower.includes('window') || lower.includes('mac') || lower.includes('linux')) return <Laptop className="h-3.5 w-3.5" />;
    return <Monitor className="h-3.5 w-3.5" />;
}

function formatTimestamp(ts: string) {
    const d = new Date(ts);
    const today = new Date().toDateString();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === today) return `Today, ${time}`;
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
}
