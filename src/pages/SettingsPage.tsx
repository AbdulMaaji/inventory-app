import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Download, Moon, Sun } from 'lucide-react';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
    const { items, categories, transactions, addCategory } = useData();
    const { user } = useAuth();
    const [isDark, setIsDark] = useState(false);
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

    const exportData = () => {
        const data = {
            shop: user?.shopId,
            items: items,
            categories: categories,
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
            category: categories.find(c => c.id === i.categoryId)?.name
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

        alert("Sample data generation requires manual reload to pick up new IDs for linking. Check categories!");
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-10">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <div className="space-y-4">


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
                        <p className="text-sm text-muted-foreground">Add sample categories</p>
                    </div>
                    <Button variant="outline" onClick={generateSampleData}>
                        Generate Data
                    </Button>
                </div>
            </div>
        </div>
    );
}
