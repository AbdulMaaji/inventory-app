import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Upload, X } from 'lucide-react';
import type { Item } from '../lib/types';

type ItemFormData = Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'shopId'>;

export default function ItemFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { items, categories, locations, addItem, updateItem } = useData();
    const isEdit = !!id;

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ItemFormData>({
        defaultValues: {
            name: '',
            sku: '',
            barcode: '',
            quantity: 0,
            minQuantity: 0,
            unit: 'pcs',
            costPrice: 0,
            sellingPrice: 0,
            description: '',
            images: [],
            customFields: {}
        }
    });

    useEffect(() => {
        if (isEdit) {
            const item = items.find(i => i.id === id);
            if (item) {
                // Set values
                Object.keys(item).forEach(key => {
                    // @ts-ignore
                    setValue(key, item[key]);
                });
            }
        }
    }, [id, items, setValue, isEdit]);

    const images = watch('images') || [];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setValue('images', [...images, base64]);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index: number) => {
        setValue('images', images.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: ItemFormData) => {
        try {
            if (isEdit && id) {
                await updateItem(id, data);
            } else {
                await addItem(data);
            }
            navigate('/items');
        } catch (e) {
            console.error(e);
            alert('Failed to save item');
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/items')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">{isEdit ? 'Edit Item' : 'New Item'}</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input {...register('name', { required: true })} placeholder="Item Name" />
                        {errors.name && <span className="text-xs text-red-500">Required</span>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">SKU</label>
                        <Input {...register('sku', { required: true })} placeholder="SKU-123" />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <select
                            {...register('categoryId', { required: true })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {errors.categoryId && <span className="text-xs text-red-500">Required</span>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <select
                            {...register('locationId', { required: true })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">Select Location</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                        {errors.locationId && <span className="text-xs text-red-500">Required</span>}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Quantity</label>
                        <Input type="number" {...register('quantity', { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Min Quantity</label>
                        <Input type="number" {...register('minQuantity', { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Unit</label>
                        <Input {...register('unit')} placeholder="pcs" />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Cost Price</label>
                        <Input type="number" step="0.01" {...register('costPrice', { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Selling Price</label>
                        <Input type="number" step="0.01" {...register('sellingPrice', { valueAsNumber: true })} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                        {...register('description')}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-medium">Images</label>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-md border overflow-hidden group">
                                <img src={img} alt="Item" className="object-cover w-full h-full" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        <label className="flex flex-col items-center justify-center aspect-square rounded-md border border-dashed hover:bg-accent cursor-pointer">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground mt-2">Upload</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/items')}>Cancel</Button>
                    <Button type="submit">Save Item</Button>
                </div>
            </form>
        </div>
    );
}
