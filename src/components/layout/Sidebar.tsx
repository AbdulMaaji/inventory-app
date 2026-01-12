import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Package, FolderTree, MapPin,
    ScanLine, Settings, X, ShoppingCart, Power, Users
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/', roles: ['owner', 'manager', 'cashier', 'stock_keeper'] },
    { label: 'Point of Sale', icon: ShoppingCart, href: '/pos', roles: ['owner', 'manager', 'cashier'] },
    { label: 'Shift', icon: Power, href: '/shift', roles: ['owner', 'manager', 'cashier', 'stock_keeper'] },
    { label: 'Inventory', icon: Package, href: '/items', roles: ['owner', 'manager', 'cashier', 'stock_keeper'] },
    { label: 'Employees', icon: Users, href: '/employees', roles: ['owner'] },
    { label: 'Categories', icon: FolderTree, href: '/categories', roles: ['owner', 'manager'] },
    { label: 'Locations', icon: MapPin, href: '/locations', roles: ['owner', 'manager'] },
    { label: 'Scan', icon: ScanLine, href: '/scan', roles: ['owner', 'manager', 'cashier', 'stock_keeper'] },
    { label: 'Settings', icon: Settings, href: '/settings', roles: ['owner', 'manager', 'cashier', 'stock_keeper'] },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user, shop } = useAuth();

    const filteredItems = NAV_ITEMS.filter(item =>
        user && item.roles.includes(user.role)
    );

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed top-0 left-0 z-50 h-screen w-64 border-r bg-card transition-transform duration-300 lg:translate-x-0 lg:static",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center justify-between border-b px-6">
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter text-primary">ShopMate</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">{shop?.name.slice(0, 15)}...</span>
                    </div>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="flex-1 space-y-1 p-4 overflow-y-auto max-h-[calc(100vh-64px)]">
                    {filteredItems.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all group",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={cn(
                                        "h-5 w-5 transition-transform group-hover:scale-110",
                                        isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"
                                    )} />
                                    {item.label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-[20px] p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                            {user?.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate">{user?.fullName || user?.username}</p>
                            <p className="text-[9px] font-black uppercase text-muted-foreground opacity-70 tracking-tighter">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
