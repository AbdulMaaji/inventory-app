import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import {
    Package2, Store, Moon, Sun, ShieldCheck,
    User as UserIcon, Phone, MapPin, Users
} from 'lucide-react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loginRole, setLoginRole] = useState<'owner' | 'staff'>('owner');
    const [shopCode, setShopCode] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    // Register specific
    const [shopName, setShopName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');

    const { login, registerShop, error, isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await login(shopCode, identifier, password);
                navigate('/');
            } else {
                const code = await registerShop({
                    name: shopName,
                    ownerName: ownerName,
                    password: password,
                    location,
                    phone
                });
                alert(`Shop Registered! Your unique Shop Code is: ${code}. Please save it for your employees.`);
                navigate('/');
            }
        } catch (err) { }
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-12 text-gray-900 dark:text-gray-100 font-sans">
            <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full bg-white/20 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm shadow-sm">
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
            </div>

            <div className="w-full max-w-md space-y-6 bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="p-4 bg-primary/10 rounded-[24px] mb-2">
                        {isLogin ? (
                            loginRole === 'owner' ? <ShieldCheck className="h-10 w-10 text-primary" /> : <Users className="h-10 w-10 text-primary" />
                        ) : (
                            <Package2 className="h-10 w-10 text-primary" />
                        )}
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">
                        {isLogin ? (loginRole === 'owner' ? 'Admin Portal' : 'Staff Portal') : 'Setup New Shop'}
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        {isLogin ? 'Enter your credentials to manage your shop' : 'Start your digital inventory journey as a Shop Owner'}
                    </p>
                </div>

                {isLogin && (
                    <div className="flex p-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-[20px] gap-1">
                        <button
                            type="button"
                            onClick={() => setLoginRole('owner')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[16px] text-xs font-black uppercase tracking-widest transition-all ${loginRole === 'owner' ? 'bg-white dark:bg-gray-700 text-primary shadow-xl shadow-primary/5' : 'text-muted-foreground hover:text-gray-900'}`}
                        >
                            <ShieldCheck className="h-4 w-4" /> Owner
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginRole('staff')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[16px] text-xs font-black uppercase tracking-widest transition-all ${loginRole === 'staff' ? 'bg-white dark:bg-gray-700 text-primary shadow-xl shadow-primary/5' : 'text-muted-foreground hover:text-gray-900'}`}
                        >
                            <Users className="h-4 w-4" /> Staff
                        </button>
                    </div>
                )}

                {error && (
                    <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {isLogin ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Shop Identification Code</label>
                                <div className="relative">
                                    <Store className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        className="pl-12 h-12 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary text-base font-bold"
                                        placeholder="MAMANGOZI"
                                        value={shopCode}
                                        onChange={(e) => setShopCode(e.target.value.toUpperCase())}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{loginRole === 'owner' ? 'Admin Phone / User' : 'Staff Phone / User'}</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        className="pl-12 h-12 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary text-base font-bold"
                                        placeholder={loginRole === 'owner' ? 'Owner Phone' : 'Staff Phone'}
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 mb-2">
                                <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                    <ShieldCheck className="h-3.5 w-3.5" /> Account Type: Master Shop Owner
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Shop Name</label>
                                    <Input
                                        className="h-12 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold"
                                        placeholder="Mama Ngozi"
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Owner Name</label>
                                    <Input
                                        className="h-12 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold"
                                        placeholder="Ngozi Okonjo"
                                        value={ownerName}
                                        onChange={(e) => setOwnerName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        className="pl-12 h-12 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold"
                                        placeholder="City, State"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        className="pl-12 h-12 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold"
                                        placeholder="080xxxxxxxx"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Secure Password</label>
                        <Input
                            type="password"
                            className="h-12 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            minLength={6}
                        />
                    </div>

                    <Button type="submit" className="w-full h-14 text-lg font-black rounded-[20px] bg-primary hover:bg-primary/90 transition-all shadow-xl shadow-primary/20" disabled={isLoading}>
                        {isLoading ? 'Encrypting...' : (isLogin ? 'Enter Portal' : 'Create My Shop')}
                    </Button>
                </form>

                <div className="text-center pt-2">
                    <button
                        type="button"
                        className="text-sm font-black text-primary hover:underline underline-offset-4"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? "Setup a new shop? Register" : "Existing shop? Sign in"}
                    </button>
                    <p className="text-[10px] text-muted-foreground mt-6 opacity-40 uppercase tracking-[0.2em] font-black leading-relaxed">
                        Secure Multi-Tenant <br /> Offline Encryption Active
                    </p>
                </div>
            </div>
        </div>
    );
}
