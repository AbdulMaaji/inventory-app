import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Power, Clock, Wallet, AlertCircle, Calendar, User, Check, X, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ShiftPage() {
    const {
        activeShift, startShift, endShift, shifts,
        shiftRequests, leaveRequests, requestShift, requestLeave,
        updateShiftRequest, updateLeaveRequest
    } = useData();
    const { user, employees } = useAuth();
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<'my-shift' | 'requests'>('my-shift');
    const navigate = useNavigate();

    const isOwner = user?.role === 'owner';

    // Owner specific data
    const activeShifts = shifts.filter(s => s.status === 'open');
    const today = new Date().toISOString().split('T')[0];
    const leavesToday = leaveRequests.filter(l => l.status === 'approved' && today >= l.startDate && today <= l.endDate);
    const pendingShiftReqs = shiftRequests.filter(r => r.status === 'pending');
    const pendingLeaveReqs = leaveRequests.filter(r => r.status === 'pending');

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

    if (isOwner) {
        return (
            <div className="space-y-8 pb-10">
                <div className="flex items-center justify-between px-2">
                    <div>
                        <h1 className="text-3xl font-black">Shift Management</h1>
                        <p className="text-muted-foreground font-medium">Monitor and manage staff schedules</p>
                    </div>
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
                        <button
                            onClick={() => setView('my-shift')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${view === 'my-shift' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-muted-foreground'}`}
                        >
                            Operations
                        </button>
                        <button
                            onClick={() => setView('requests')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${view === 'requests' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-muted-foreground'}`}
                        >
                            Requests ({pendingShiftReqs.length + pendingLeaveReqs.length})
                        </button>
                    </div>
                </div>

                {view === 'my-shift' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h2 className="text-xl font-black flex items-center gap-2 px-2">
                                <Clock className="text-primary" /> Currently in Shift
                            </h2>
                            <div className="space-y-4">
                                {activeShifts.map(s => {
                                    const staff = employees.find(e => e.id === s.userId);
                                    return (
                                        <div key={s.id} className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase">
                                                    {staff?.username.slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-black">{staff?.fullName || staff?.username}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Started {new Date(s.startTime).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-muted-foreground uppercase opacity-70">Opening Cash</p>
                                                <p className="font-black text-primary">{currency(s.openingCash)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {activeShifts.length === 0 && <p className="text-center py-10 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-[32px] text-muted-foreground italic">No staff currently in shift</p>}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl font-black flex items-center gap-2 px-2">
                                <Calendar className="text-orange-500" /> On Leave Today
                            </h2>
                            <div className="space-y-4">
                                {leavesToday.map(l => {
                                    const staff = employees.find(e => e.id === l.userId);
                                    return (
                                        <div key={l.id} className="bg-orange-50/50 dark:bg-orange-900/10 p-6 rounded-[32px] border border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-black uppercase">
                                                    {staff?.username.slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-black">{staff?.fullName || staff?.username}</p>
                                                    <p className="text-[10px] font-bold text-orange-600 uppercase">Until {new Date(l.endDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <FileText className="h-5 w-5 text-orange-400" />
                                        </div>
                                    );
                                })}
                                {leavesToday.length === 0 && <p className="text-center py-10 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-[32px] text-muted-foreground italic">No staff on leave today</p>}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-xl font-black px-2 flex items-center gap-2">
                                <Clock className="text-primary h-5 w-5" /> Shift Requests
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pendingShiftReqs.map(r => {
                                    const staff = employees.find(e => e.id === r.userId);
                                    return (
                                        <ShiftRequestCard
                                            key={r.id}
                                            req={r}
                                            staff={staff}
                                            onApprove={() => updateShiftRequest(r.id, 'approved')}
                                            onReject={() => updateShiftRequest(r.id, 'rejected')}
                                        />
                                    );
                                })}
                                {pendingShiftReqs.length === 0 && <p className="col-span-full py-10 text-center text-muted-foreground">No pending shift requests</p>}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-black px-2 flex items-center gap-2">
                                <Calendar className="text-orange-500 h-5 w-5" /> Leave Requests
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pendingLeaveReqs.map(r => {
                                    const staff = employees.find(e => e.id === r.userId);
                                    return (
                                        <LeaveRequestCard
                                            key={r.id}
                                            req={r}
                                            staff={staff}
                                            onApprove={() => updateLeaveRequest(r.id, 'approved')}
                                            onReject={() => updateLeaveRequest(r.id, 'rejected')}
                                        />
                                    );
                                })}
                                {pendingLeaveReqs.length === 0 && <p className="col-span-full py-10 text-center text-muted-foreground">No pending leave requests</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

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
                <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-primary/5 space-y-6">
                        <div className="text-center space-y-2 mb-8">
                            <div className="h-20 w-20 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto text-primary">
                                <Power className="h-10 w-10" />
                            </div>
                            <h2 className="text-2xl font-black">Ready to Start?</h2>
                            <p className="text-muted-foreground font-medium">Please enter your opening cash balance.</p>
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

                    <ShiftRequestForms requestShift={requestShift} requestLeave={requestLeave} />
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
                </div>
            )}
        </div>
    );
}

function ShiftRequestCard({ req, staff, onApprove, onReject }: any) {
    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase">
                        {staff?.username.slice(0, 2)}
                    </div>
                    <div>
                        <p className="font-black text-sm">{staff?.fullName || staff?.username}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(req.date).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onReject} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><X className="h-4 w-4" /></button>
                    <button onClick={onApprove} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"><Check className="h-4 w-4" /></button>
                </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Reason / Notes</p>
                <p className="text-sm font-medium">{req.reason}</p>
                <p className="text-[10px] font-black text-primary mt-2 uppercase tracking-tighter">{req.startTime} - {req.endTime}</p>
            </div>
        </div>
    );
}

function LeaveRequestCard({ req, staff, onApprove, onReject }: any) {
    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black uppercase">
                        {staff?.username.slice(0, 2)}
                    </div>
                    <div>
                        <p className="font-black text-sm">{staff?.fullName || staff?.username}</p>
                        <p className="text-[10px] font-bold text-orange-600 uppercase">Leave Request</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onReject} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><X className="h-4 w-4" /></button>
                    <button onClick={onApprove} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"><Check className="h-4 w-4" /></button>
                </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}</p>
                <p className="text-sm font-medium">{req.reason}</p>
            </div>
        </div>
    );
}

function ShiftRequestForms({ requestShift, requestLeave }: any) {
    const [date, setDate] = useState('');
    const [start, setStart] = useState('08:00');
    const [end, setEnd] = useState('17:00');
    const [reason, setReason] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [leaveReason, setLeaveReason] = useState('');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                <h3 className="text-xl font-black flex items-center gap-2">
                    <Clock className="text-primary h-5 w-5" /> Request a Shift
                </h3>
                <form className="space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    await requestShift({ date, startTime: start, endTime: end, reason });
                    setReason('');
                }}>
                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                    <div className="grid grid-cols-2 gap-2">
                        <Input type="time" value={start} onChange={e => setStart(e.target.value)} required />
                        <Input type="time" value={end} onChange={e => setEnd(e.target.value)} required />
                    </div>
                    <textarea
                        placeholder="Reason for shifting shift..."
                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-medium border-none focus:ring-2 focus:ring-primary h-24"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        required
                    />
                    <Button type="submit" className="w-full rounded-2xl font-black uppercase text-xs tracking-widest">Submit Request</Button>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                <h3 className="text-xl font-black flex items-center gap-2">
                    <Calendar className="text-orange-500 h-5 w-5" /> Request Leave
                </h3>
                <form className="space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    await requestLeave({ startDate, endDate, reason: leaveReason });
                    setLeaveReason('');
                }}>
                    <div className="grid grid-cols-2 gap-2">
                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                    </div>
                    <textarea
                        placeholder="Reason for leave request..."
                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-medium border-none focus:ring-2 focus:ring-primary h-24"
                        value={leaveReason}
                        onChange={e => setLeaveReason(e.target.value)}
                        required
                    />
                    <Button type="submit" variant="secondary" className="w-full rounded-2xl font-black uppercase text-xs tracking-widest">Submit Leave</Button>
                </form>
            </div>
        </div>
    );
}
