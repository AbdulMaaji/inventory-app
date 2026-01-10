import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Package, FolderTree, MapPin,
    ScanLine, Settings, X
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { label: 'Inventory', icon: Package, href: '/items' },
    { label: 'Categories', icon: FolderTree, href: '/categories' },
    { label: 'Locations', icon: MapPin, href: '/locations' },
    { label: 'Scan', icon: ScanLine, href: '/scan' },
    { label: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
                <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px]">
                    <div className="flex items-center gap-2 font-semibold">
                        <span className="text-lg">InventoryApp</span>
                    </div>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="space-y-1 p-4">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
}
