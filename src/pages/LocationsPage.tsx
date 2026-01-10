import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Trash2 } from 'lucide-react';

export default function LocationsPage() {
    const { locations, addLocation, deleteLocation } = useData();
    const [newLocation, setNewLocation] = useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLocation.trim()) return;
        await addLocation({ name: newLocation, description: '' });
        setNewLocation('');
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Locations</h1>

            <form onSubmit={handleAdd} className="flex gap-2">
                <Input
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="New Location Name"
                />
                <Button type="submit">Add</Button>
            </form>

            <div className="space-y-2">
                {locations.map(l => (
                    <div key={l.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                        <span>{l.name}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => deleteLocation(l.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                {locations.length === 0 && <p className="text-muted-foreground text-center py-4">No locations added.</p>}
            </div>
        </div>
    );
}
