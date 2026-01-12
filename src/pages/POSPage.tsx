import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
    Search, ShoppingCart, Trash2, Plus, Minus,
    CreditCard, Banknote, Landmark, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function POSPage() {
    const { items, createSale, activeShift } = useData();
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<{ itemId: string; name: string; price: number; quantity: number }[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'pos'>('cash');
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    const filteredItems = useMemo(() => {
        return items.filter(i =>
            i.name.toLowerCase().includes(search.toLowerCase()) ||
            i.barcode?.includes(search) ||
            i.sku.toLowerCase().includes(search.toLowerCase())
        ).slice(0, 10);
    }, [items, search]);

    const addToCart = (item: typeof items[0]) => {
        setCart(prev => {
            const existing = prev.find(p => p.itemId === item.id);
            if (existing) {
                return prev.map(p => p.itemId === item.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { itemId: item.id, name: item.name, price: item.sellingPrice, quantity: 1 }];
        });
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(p => {
            if (p.itemId === itemId) {
                const newQty = Math.max(1, p.quantity + delta);
                return { ...p, quantity: newQty };
            }
            return p;
        }));
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(p => p.itemId !== itemId));
    };

    const total = cart.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const currency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NGN' }).format(val);

    const handleCompleteSale = async () => {
        if (cart.length === 0) return;
        setProcessing(true);
        try {
            await createSale({
                items: cart.map(p => ({ itemId: p.itemId, quantity: p.quantity })),
                paymentMethod
            });
            alert("Sale Completed Successfully!");
            setCart([]);
            navigate('/');
        } catch (e: any) {
            alert("Error: " + e.message);
        }
        setProcessing(false);
    };

    if (!activeShift) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="p-6 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full">
                    <ShoppingCart className="h-12 w-12" />
                </div>
                <h2 className="text-2xl font-black">Hold On!</h2>
                <p className="text-muted-foreground text-center max-w-xs font-medium">You must start your shift before you can record any sales.</p>
                <Button onClick={() => navigate('/shift')}>Go to Shift Management</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[80vh] items-stretch">
            {/* Products Search & Selection */}
            <div className="flex-1 space-y-6">
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 h-6 w-6 text-muted-foreground" />
                    <Input
                        placeholder="Search product name, SKU or barcode..."
                        className="h-14 pl-12 text-lg font-medium bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 rounded-[20px] shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => addToCart(item)}
                            className="bg-white dark:bg-gray-900 p-4 rounded-[28px] border border-gray-100 dark:border-gray-800 hover:border-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm flex flex-col items-start text-left gap-2 group"
                        >
                            <div className="w-full aspect-square rounded-[20px] bg-gray-50 dark:bg-gray-800 overflow-hidden flex items-center justify-center mb-1">
                                {item.images[0] ? (
                                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Package className="h-10 w-10 text-gray-300" />
                                )}
                            </div>
                            <p className="font-black text-sm line-clamp-2 leading-tight h-10">{item.name}</p>
                            <div className="flex items-center justify-between w-full mt-auto">
                                <span className="font-extrabold text-primary">{currency(item.sellingPrice)}</span>
                                <span className="text-[10px] uppercase font-black text-muted-foreground opacity-50">{item.quantity} in stock</span>
                            </div>
                            <div className="absolute top-2 right-2 p-1.5 bg-primary rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus className="h-4 w-4" />
                            </div>
                        </button>
                    ))}
                    {search && filteredItems.length === 0 && (
                        <div className="col-span-full py-10 text-center text-muted-foreground">No matches found for "{search}"</div>
                    )}
                </div>
            </div>

            {/* Cart & Checkout */}
            <div className="w-full lg:w-[400px] flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] shadow-2xl overflow-hidden self-start sticky top-24">
                <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="text-xl font-black flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" /> Cart Items
                    </h3>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black">{cart.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[400px] p-6 space-y-4">
                    {cart.map(p => (
                        <div key={p.itemId} className="flex items-center justify-between group">
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="font-bold text-sm truncate">{p.name}</p>
                                <p className="text-xs text-muted-foreground font-medium">{currency(p.price)} per unit</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => updateQuantity(p.itemId, -1)}
                                    className="p-1 h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200"
                                >
                                    <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center font-black text-sm">{p.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(p.itemId, 1)}
                                    className="p-1 h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200"
                                >
                                    <Plus className="h-3 w-3" />
                                </button>
                                <button
                                    onClick={() => removeFromCart(p.itemId)}
                                    className="p-1 h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 ml-2"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="py-20 text-center space-y-2">
                            <p className="text-muted-foreground font-medium italic text-sm">Cart is empty.</p>
                            <p className="text-[10px] text-gray-400">Search for products on the left</p>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800 space-y-6">
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            <PaymentBtn active={paymentMethod === 'cash'} label="Cash" icon={<Banknote />} onClick={() => setPaymentMethod('cash')} />
                            <PaymentBtn active={paymentMethod === 'transfer'} label="Transf." icon={<Landmark />} onClick={() => setPaymentMethod('transfer')} />
                            <PaymentBtn active={paymentMethod === 'pos'} label="POS" icon={<CreditCard />} onClick={() => setPaymentMethod('pos')} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">Total Amount</span>
                            <span className="text-3xl font-black text-primary">{currency(total)}</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleCompleteSale}
                        disabled={cart.length === 0 || processing}
                        className="w-full h-16 rounded-[24px] text-xl font-black shadow-xl shadow-primary/20"
                    >
                        {processing ? 'Processing...' : 'Complete Sale'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function PaymentBtn({ active, label, icon, onClick }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${active ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 dark:border-gray-800 text-muted-foreground hover:bg-gray-50'}`}
        >
            {React.cloneElement(icon, { className: 'h-5 w-5' })}
            <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
            {active && <div className="absolute top-1 right-1"><Check className="h-2.5 w-2.5" /></div>}
        </button>
    );
}

import { Package } from 'lucide-react';
import React from 'react';
