import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Download, Moon, Sun, UserPlus, Users } from 'lucide-react';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
    const { items, categories, locations, transactions, addCategory, addLocation } = useData();
    const { user, createEmployee } = useAuth();
    const [isDark, setIsDark] = useState(false);

    // Employee Form State
    const [empName, setEmpName] = useState('');
    const [empPass, setEmpPass] = useState('');
    const [isLoadingEmp, setIsLoadingEmp] = useState(false);

    useEffect(() => {
        if (document.documentElement.classList.contains('dark')) {
            setIsDark(true);
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        }
    };

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!empName || !empPass) return;

        try {
            setIsLoadingEmp(true);
            await createEmployee(empName, empPass);
            alert(`Employee ${empName} created successfully. They can now log in.`);
            setEmpName('');
            setEmpPass('');
        } catch (err: any) {
            alert(`Failed to create employee: ${err.message}`);
        } finally {
            setIsLoadingEmp(false);
        }
    };

    const exportData = () => {
        const data = {
            shop: user?.shopId,
            items: items,
            categories: categories,
            locations: locations,
            transactions: transactions
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const exportCSV = () => {
        const csv = Papa.unparse(items.map(i => ({
            id: i.id,
            name: i.name,
            sku: i.sku,
            quantity: i.quantity,
            cost: i.costPrice,
            price: i.sellingPrice,
            category: categories.find(c => c.id === i.categoryId)?.name,
            location: locations.find(l => l.id === i.locationId)?.name
        })));

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_items_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };


    const generateSampleData = async () => {
        if (!confirm("This will add sample data to your inventory. Continue?")) return;

        // Add Categories
        await addCategory({ name: 'Electronics', description: 'Gadgets and devices' });
        await addCategory({ name: 'Office Supplies', description: 'Stationery' });

        // Add Locations
        await addLocation({ name: 'Warehouse A', address: '123 Main St' });
        await addLocation({ name: 'Store Front', address: '456 Market St' });

        alert("Sample data generation requires manual reload to pick up new IDs for linking. Check categories and locations!");
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-10">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <div className="space-y-4">
                {/* Employee Management Section - Owner Only */}
                {user?.role === 'owner' && (
                    <div className="p-4 border rounded-lg bg-card shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium text-lg">Employee Management</h3>
                                <p className="text-sm text-muted-foreground">Add employees to your shop</p>
                            </div>
                        </div>

                        <div className="bg-muted/30 p-4 rounded-md border">
                            <form onSubmit={handleAddEmployee} className="grid gap-4 sm:grid-cols-2 items-end">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Username</label>
                                    <Input
                                        placeholder="employee_user"
                                        value={empName}
                                        onChange={(e) => setEmpName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Password</label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={empPass}
                                        onChange={(e) => setEmpPass(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Button type="submit" className="w-full" disabled={isLoadingEmp}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        {isLoadingEmp ? 'Creating...' : 'Create Employee Account'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm">
                    <div>
                        <h3 className="font-medium">Appearance</h3>
                        <p className="text-sm text-muted-foreground">Toggle dark mode</p>
                    </div>
                    <Button variant="outline" size="icon" onClick={toggleTheme}>
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm">
                    <div>
                        <h3 className="font-medium">Export Data (CSV)</h3>
                        <p className="text-sm text-muted-foreground">Export item list for external use</p>
                    </div>
                    <Button variant="outline" onClick={exportCSV}>
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm">
                    <div>
                        <h3 className="font-medium">Full Backup (JSON)</h3>
                        <p className="text-sm text-muted-foreground">Download all application data</p>
                    </div>
                    <Button variant="outline" onClick={exportData}>
                        <Download className="mr-2 h-4 w-4" /> Backup JSON
                    </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm">
                    <div>
                        <h3 className="font-medium">Demo Data</h3>
                        <p className="text-sm text-muted-foreground">Add sample categories and locations</p>
                    </div>
                    <Button variant="outline" onClick={generateSampleData}>
                        Generate Data
                    </Button>
                </div>
            </div>
        </div>
    );
}
