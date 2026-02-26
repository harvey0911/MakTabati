import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../services/api';
import { AlertCircle, ShoppingCart } from 'lucide-react';

const LowStockList = () => {
    const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLowStock = async () => {
            try {
                const data = await inventoryApi.getLowStock();
                setLowStockProducts(data);
            } catch (error) {
                console.error("Failed to fetch low stock", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLowStock();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={20} /> Items Needing Reorder
                </h3>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '12px' }}>Product</th>
                        <th style={{ padding: '12px' }}>SKU</th>
                        <th style={{ padding: '12px' }}>Current Stock</th>
                        <th style={{ padding: '12px' }}>Reorder Level</th>
                        <th style={{ padding: '12px' }}>Deficit</th>
                        <th style={{ padding: '12px' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {lowStockProducts.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <p>All stock levels are healthy.</p>
                            </td>
                        </tr>
                    ) : lowStockProducts.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fef2f2' }}>
                            <td style={{ padding: '12px', fontWeight: 500 }}>{p.name}</td>
                            <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{p.sku || '-'}</td>
                            <td style={{ padding: '12px', color: '#ef4444', fontWeight: 'bold' }}>
                                {p.total_stock} {p.unit}
                            </td>
                            <td style={{ padding: '12px' }}>{p.reorder_level} {p.unit}</td>
                            <td style={{ padding: '12px' }}>
                                {p.reorder_level - p.total_stock} {p.unit}
                            </td>
                            <td style={{ padding: '12px' }}>
                                <button style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '6px 12px', borderRadius: '6px',
                                    backgroundColor: 'var(--card-bg)', border: '1px solid #e2e8f0',
                                    cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)'
                                }}>
                                    <ShoppingCart size={14} /> Create PO
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LowStockList;
