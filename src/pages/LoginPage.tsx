import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { Package2, Store, Moon, Sun, ShieldCheck, User as UserIcon, Phone, MapPin } from 'lucide-react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
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
        <div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-12 text-gray-900 dark:text-gray-100">
            <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full bg-white/20 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm shadow-sm">
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
            </div>

            <div className="w-full max-w-md space-y-6 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="p-4 bg-primary/10 rounded-2xl mb-2">
                        <Package2 className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        {isLogin ? 'Shop Sign In' : 'Register New Shop'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isLogin ? 'Enter your shop details to continue' : 'Start your digital inventory journey today'}
                    </p>
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {isLogin ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Shop Code</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        className="pl-10 h-11 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary"
                                        placeholder="MAMANGOZI"
                                        value={shopCode}
                                        onChange={(e) => setShopCode(e.target.value.toUpperCase())}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Phone or Username</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        className="pl-10 h-11 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary"
                                        placeholder="080xxxxxxx"
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold ml-1">Shop Name</label>
                                    <Input
                                        className="h-11 bg-gray-50 dark:bg-gray-800 border-none rounded-xl"
                                        placeholder="Mama Ngozi"
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold ml-1">Owner Name</label>
                                    <Input
                                        className="h-11 bg-gray-50 dark:bg-gray-800 border-none rounded-xl"
                                        placeholder="Ngozi Okonjo"
                                        value={ownerName}
                                        onChange={(e) => setOwnerName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Location / Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        className="pl-10 h-11 bg-gray-50 dark:bg-gray-800 border-none rounded-xl"
                                        placeholder="City, State"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Owner Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        className="pl-10 h-11 bg-gray-50 dark:bg-gray-800 border-none rounded-xl"
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
                        <label className="text-sm font-semibold ml-1">Password</label>
                        <Input
                            type="password"
                            className="h-11 bg-gray-50 dark:bg-gray-800 border-none rounded-xl"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            minLength={6}
                        />
                    </div>

                    <Button type="submit" className="w-full h-12 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20" disabled={isLoading}>
                        {isLoading ? 'Processing...' : (isLogin ? 'Enter Shop' : 'Create My Shop')}
                    </Button>
                </form>

                <div className="text-center pt-4">
                    <button
                        type="button"
                        className="text-sm font-medium text-primary hover:underline underline-offset-4"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? "Need a new shop? Register here" : "Already have a shop? Sign in"}
                    </button>
                    <p className="text-[10px] text-muted-foreground mt-4 opacity-50 uppercase tracking-widest ont-bold">
                        Secure Offline-First Encryption Enabled
                    </p>
                </div>
            </div>
        </div>
    );
}
