import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function ScanPage() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const { items } = useData();
    const navigate = useNavigate();

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
        );

        scanner.render((decodedText) => {
            setScanResult(decodedText);
            scanner.clear();
        }, (error) => {
            // console.warn(error);
        });

        return () => {
            scanner.clear().catch(e => console.error("Failed to clear scanner", e));
        };
    }, []);

    useEffect(() => {
        if (scanResult) {
            const item = items.find(i => i.barcode === scanResult || i.sku === scanResult);
            if (item) {
                // Navigate to item
                navigate(`/items/${item.id}`);
            } else {
                // Behave like "Add New" with prefilled barcode?
                // Since I can't easily pass state to existing form via URL standard params without parsing them,
                // I'll just show a message.
                const doCreate = window.confirm(`Item with barcode ${scanResult} not found. Create it?`);
                if (doCreate) {
                    navigate('/items/new');
                    // Ideally I would pass state: { barcode: scanResult }
                } else {
                    setScanResult(null);
                    window.location.reload(); // Quick reset
                }
            }
        }
    }, [scanResult, items, navigate]);

    return (
        <div className="flex flex-col items-center justify-center space-y-6">
            <h1 className="text-2xl font-bold">Scan Barcode</h1>
            <div id="reader" className="w-full max-w-sm border rounded-lg overflow-hidden"></div>
            <p className="text-sm text-muted-foreground">
                Point your camera at a barcode or QR code.
            </p>
            {scanResult && (
                <div className="text-center">
                    <p>Scanned: {scanResult}</p>
                    <Button onClick={() => window.location.reload()}>Scan Again</Button>
                </div>
            )}
        </div>
    );
}
