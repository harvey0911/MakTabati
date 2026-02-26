import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../services/api';
import { History, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const StockMovementsList = () => {
    const [movements, setMovements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovements = async () => {
            try {
                const data = await inventoryApi.getMovements();
                setMovements(data);
            } catch (error) {
                console.error("Failed to fetch movements", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovements();
    }, []);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'PURCHASE_RECEIPT':
            case 'TRANSFER_IN':
                return { bg: '#ecfdf5', text: '#10b981', icon: <ArrowDownLeft size={16} /> }; 
            case 'SALE':
            case 'RETURN':
            case 'TRANSFER_OUT':
                return { bg: '#fef2f2', text: '#ef4444', icon: <ArrowUpRight size={16} /> }; 
            case 'ADJUSTMENT':
                return { bg: '#fffbeb', text: '#f59e0b', icon: <History size={16} /> }; 
            default:
                return { bg: 'var(--background)', text: 'var(--text-muted)', icon: <History size={16} /> };
        }
    };

    if (loading) return <div>Loading movements...</div>;

    return (
        <div className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Stock Movements History</h3>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '12px' }}>Date</th>
                        <th style={{ padding: '12px' }}>Product</th>
                        <th style={{ padding: '12px' }}>Type</th>
                        <th style={{ padding: '12px' }}>Qty Change</th>
                        <th style={{ padding: '12px' }}>Location</th>
                        <th style={{ padding: '12px' }}>User</th>
                        <th style={{ padding: '12px' }}>Note</th>
                    </tr>
                </thead>
                <tbody>
                    {movements.length === 0 ? (
                        <tr>
                            <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <History size={48} style={{ margin: '0 auto', opacity: 0.5 }} />
                                <p>No movements recorded yet.</p>
                            </td>
                        </tr>
                    ) : movements.map(m => {
                        const style = getTypeColor(m.type);
                        return (
                            <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    {new Date(m.created_at).toLocaleString()}
                                </td>
                                <td style={{ padding: '12px', fontWeight: 500 }}>{m.product_name}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                                        backgroundColor: style.bg, color: style.text
                                    }}>
                                        {style.icon} {m.type.replace('_', ' ')}
                                    </span>
                                </td>
                                <td style={{ padding: '12px', fontWeight: 600, color: m.quantity > 0 ? '#10b981' : (m.quantity < 0 ? '#ef4444' : 'var(--text-main)') }}>
                                    {m.quantity > 0 ? '+' : ''}{m.quantity}
                                </td>
                                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{m.location_name}</td>
                                <td style={{ padding: '12px' }}>{m.created_by || 'System'}</td>
                                <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{m.note}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default StockMovementsList;
