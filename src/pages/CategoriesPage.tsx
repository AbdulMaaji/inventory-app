import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Trash2 } from 'lucide-react';

export default function CategoriesPage() {
    const { categories, addCategory, deleteCategory } = useData();
    const [newCategory, setNewCategory] = useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        await addCategory({ name: newCategory, description: '' });
        setNewCategory('');
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>

            <form onSubmit={handleAdd} className="flex gap-2">
                <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New Category Name"
                />
                <Button type="submit">Add</Button>
            </form>

            <div className="space-y-2">
                {categories.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                        <span>{c.name}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => deleteCategory(c.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                {categories.length === 0 && <p className="text-muted-foreground text-center py-4">No categories added.</p>}
            </div>
        </div>
    );
}
