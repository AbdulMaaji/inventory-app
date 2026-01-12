import { Menu, LogOut, Bell, Search, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { logout, shop } = useAuth();
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <header className="flex h-16 items-center gap-4 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md px-6 sticky top-0 z-30">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
                <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1 hidden md:flex items-center">
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search anything..."
                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-[14px] pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter sm:flex hidden ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                    {isOnline ? 'Online Syncing' : 'Offline Mode'}
                </div>

                <Button variant="ghost" size="icon" className="relative h-10 w-10 bg-gray-50 dark:bg-gray-900 rounded-[14px]">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-950" />
                </Button>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block" />

                <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-0.5">Shop Code</span>
                    <span className="text-xs font-black text-primary leading-none uppercase">{shop?.code}</span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { if (confirm('Log out from shop?')) logout(); }}
                    className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-[14px]"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
