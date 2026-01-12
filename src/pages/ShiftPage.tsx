import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Power, Clock, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ShiftPage() {
    const { activeShift, startShift, endShift, sales } = useData();
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const currentShiftSales = sales.filter(s => s.shiftId === activeShift?.id && s.paymentMethod === 'cash');
    const totalCashSales = currentShiftSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const expectedClosing = activeShift ? activeShift.openingCash + totalCashSales : 0;

    const currency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NGN' }).format(val);

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await startShift(Number(amount));
            navigate('/');
        } catch (e) { }
        setLoading(false);
    };

    const handleEnd = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await endShift(Number(amount), notes);
            navigate('/');
        } catch (e) { }
        setLoading(false);
    };

    return (
        <div className="max-w-xl mx-auto py-10 space-y-8">
            <div className="flex items-center justify-between px-2">
                <h1 className="text-3xl font-black">Shift Management</h1>
                <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase flex items-center gap-2 ${activeShift ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <div className={`h-2 w-2 rounded-full ${activeShift ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`} />
                    {activeShift ? 'Shift Active' : 'Shift Inactive'}
                </div>
            </div>

            {!activeShift ? (
                <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-primary/5 space-y-6">
                    <div className="text-center space-y-2 mb-8">
                        <div className="h-20 w-20 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto text-primary">
                            <Power className="h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-black">Ready to Start?</h2>
                        <p className="text-muted-foreground font-medium">Please enter your opening cash balance from the register.</p>
                    </div>

                    <form onSubmit={handleStart} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Opening Cash (₦)</label>
                            <div className="relative">
                                <Wallet className="absolute left-4 top-3.5 h-6 w-6 text-muted-foreground" />
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="h-14 pl-12 text-xl font-bold bg-gray-50 dark:bg-gray-800 border-none rounded-2xl"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/20" disabled={loading}>
                            {loading ? 'Starting...' : 'Start My Shift'}
                        </Button>
                    </form>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Started At</p>
                            <p className="font-black text-lg flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                {new Date(activeShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Opening Balance</p>
                            <p className="font-black text-lg text-primary">{currency(activeShift.openingCash)}</p>
                        </div>
                    </div>

                    <div className="bg-primary/5 dark:bg-primary/10 p-8 rounded-[32px] border-2 border-primary/10 space-y-4">
                        <div className="flex justify-between items-center text-primary">
                            <h3 className="text-lg font-black">Shift Intelligence</h3>
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="font-medium opacity-70">Cash Sales Tracking</span>
                                <span className="font-black">{currency(totalCashSales)}</span>
                            </div>
                            <div className="h-px bg-primary/10" />
                            <div className="flex justify-between items-center text-xl">
                                <span className="font-black">Expected Closing Cash</span>
                                <span className="font-black underline decoration-4 decoration-primary/20">{currency(expectedClosing)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                        <h3 className="text-xl font-black">Close Out Shift</h3>
                        <form onSubmit={handleEnd} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Physical Cash in Counter (₦)</label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="h-14 text-xl font-bold bg-gray-50 dark:bg-gray-800 border-none rounded-2xl"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Shift Notes (Optional)</label>
                                <textarea
                                    placeholder="Any shortages, errors, or feedback?"
                                    className="w-full p-4 min-h-[100px] bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-medium focus:ring-2 focus:ring-primary"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black bg-red-500 hover:bg-red-600 shadow-xl shadow-red-500/20" disabled={loading}>
                                {loading ? 'Closing...' : 'Close Shift & Clock Out'}
                            </Button>
                        </form>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl text-orange-800 dark:text-orange-200 text-sm">
                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p className="font-medium">Please count your cash accurately. High variances are automatically flagged for the owner's review.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
