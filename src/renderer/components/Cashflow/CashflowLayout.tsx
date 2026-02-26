import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../services/api';
import { History, ArrowUpRight, ArrowDownLeft, Ban, Plus, X, ShoppingCart, RotateCcw } from 'lucide-react';
import Modal from '../Modal';

const CashflowLayout = ({ onNavigateToSell, onNavigateToReturn }: { onNavigateToSell?: () => void, onNavigateToReturn?: () => void }) => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal Alert state
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, title: string, message: string, type: 'info' | 'success' | 'error' | 'confirm', onConfirm?: () => void }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const showAlert = (title: string, message: string, type: 'info' | 'success' | 'error' | 'confirm' = 'info', onConfirm?: () => void) => {
        setModalConfig({ isOpen: true, title, message, type, onConfirm });
    };

    const [showModal, setShowModal] = useState(false);
    const [transactionType, setTransactionType] = useState<'SALE' | 'RETURN'>('SALE');
    const [amount, setAmount] = useState<number | ''>('');
    const [note, setNote] = useState('');
    const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTransactions = async () => {
        try {
            const data = await inventoryApi.getTransactions();
            setTransactions(data);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
        inventoryApi.getProducts().then(setProducts).catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedProductId !== '' && quantity !== '') {
            const product = products.find(p => p.id === selectedProductId);
            if (product) {
                setAmount(product.sell_price * (quantity as number));
            }
        }
    }, [selectedProductId, quantity, products]);

    const openModal = (type: 'SALE' | 'RETURN') => {
        setTransactionType(type);
        setAmount('');
        setNote('');
        setSelectedProductId('');
        setQuantity('');
        setShowModal(true);
    };

    const handleManualTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || amount <= 0) return showAlert('Error', 'Enter a valid amount', 'error');

        if (transactionType === 'SALE' && selectedProductId !== '') {
            const product = products.find(p => p.id === selectedProductId);
            if (product && (quantity as number) > product.total_stock) {
                return showAlert('Error', `Cannot sell more than available stock (${product.total_stock})`, 'error');
            }
        }

        setIsSubmitting(true);
        try {
            await inventoryApi.recordTransaction({
                type: transactionType,
                amount: Number(amount),
                note: note || `Manual ${transactionType}`,
                created_by: 'Admin',
                product_id: selectedProductId === '' ? undefined : selectedProductId,
                quantity: quantity === '' ? undefined : quantity
            });
            setShowModal(false);
            await fetchTransactions();
            inventoryApi.getProducts().then(setProducts).catch(console.error);
            showAlert('Success', `${transactionType === 'SALE' ? 'Sale' : 'Return'} recorded successfully!`, 'success');
        } catch (error) {
            console.error(error);
            showAlert('Error', `Failed to record ${transactionType}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'SALE':
                return { bg: '#ecfdf5', text: '#10b981', icon: <ArrowDownLeft size={16} /> };
            case 'RETURN':
            case 'EXPENSE':
                return { bg: '#fef2f2', text: '#ef4444', icon: <ArrowUpRight size={16} /> };
            default:
                return { bg: 'var(--background)', text: 'var(--text-muted)', icon: <Ban size={16} /> };
        }
    };

    if (loading) return <div>Loading cashflow...</div>;


    const totalSales = transactions.filter(t => t.type === 'SALE').reduce((sum, t) => sum + t.amount, 0);
    const totalReturns = transactions.filter(t => t.type === 'RETURN').reduce((sum, t) => sum + t.amount, 0);
    const netCashflow = totalSales - totalReturns;

    return (
        <div style={{ width: '100%' }}>
            { }
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1.5rem' }}>
                <button onClick={onNavigateToSell} style={{ ...actionBtnStyle, backgroundColor: '#10b981', color: 'white' }}>
                    <ShoppingCart size={16} /> New Sale
                </button>
                <button onClick={onNavigateToReturn} style={{ ...actionBtnStyle, backgroundColor: '#ef4444', color: 'white' }}>
                    <RotateCcw size={16} /> New Return
                </button>
            </div>

            { }
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Sales (In)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#10b981' }}>${totalSales.toFixed(2)}</div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Returns (Out)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ef4444' }}>${totalReturns.toFixed(2)}</div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Net Cashflow</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: netCashflow >= 0 ? '#10b981' : '#ef4444' }}>
                        ${netCashflow.toFixed(2)}
                    </div>
                </div>
            </div>

            { }
            <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Transaction History</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '12px' }}>Date</th>
                            <th style={{ padding: '12px' }}>Type</th>
                            <th style={{ padding: '12px' }}>Reference</th>
                            <th style={{ padding: '12px' }}>Amount</th>
                            <th style={{ padding: '12px' }}>Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <History size={48} style={{ margin: '0 auto', opacity: 0.5, marginBottom: '1rem' }} />
                                    <p>No transactions recorded.</p>
                                </td>
                            </tr>
                        ) : transactions.map(t => {
                            const style = getTypeColor(t.type);
                            return (
                                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        {new Date(t.created_at).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                                            backgroundColor: style.bg, color: style.text
                                        }}>
                                            {style.icon} {t.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                                        {t.order_id ? `Order #${t.order_id}` : (t.product_name || '-')}
                                    </td>
                                    <td style={{ padding: '12px', fontWeight: 600, color: style.text }}>
                                        {t.type === 'SALE' ? '+' : '-'}${t.amount.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t.note}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            { }
            {showModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Record {transactionType}</h2>
                            <button onClick={() => setShowModal(false)} style={closeBtnStyle}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleManualTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Product (Optional)</label>
                                <select
                                    style={inputStyle}
                                    value={selectedProductId}
                                    onChange={e => setSelectedProductId(e.target.value === '' ? '' : Number(e.target.value))}
                                >
                                    <option value="">-- No Product (Manual Entry) --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.total_stock})</option>
                                    ))}
                                </select>
                            </div>

                            {selectedProductId !== '' && (
                                <div>
                                    <label style={labelStyle}>Quantity</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        style={inputStyle}
                                        value={quantity}
                                        onChange={e => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value))}
                                    />
                                </div>
                            )}

                            <div>
                                <label style={labelStyle}>Amount ($)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    style={inputStyle}
                                    value={amount}
                                    onChange={e => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Note / Reason</label>
                                <textarea
                                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    placeholder={`Reason for ${transactionType.toLowerCase()}...`}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={cancelBtnStyle}>Cancel</button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        ...submitBtnStyle,
                                        backgroundColor: transactionType === 'SALE' ? '#10b981' : '#ef4444'
                                    }}
                                >
                                    {isSubmitting ? 'Saving...' : `Save ${transactionType}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onConfirm={modalConfig.onConfirm}
            />
        </div>
    );
};


const actionBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 16px', borderRadius: '8px', border: 'none',
    cursor: 'pointer', fontWeight: 500
};

const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
};

const modalContentStyle: React.CSSProperties = {
    backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '2rem',
    width: '100%', maxWidth: '400px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

const closeBtnStyle: React.CSSProperties = {
    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
};

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '4px'
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1',
    fontSize: '0.875rem', outline: 'none'
};

const cancelBtnStyle: React.CSSProperties = {
    padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'var(--card-bg)',
    color: '#475569', fontWeight: 500, cursor: 'pointer'
};

const submitBtnStyle: React.CSSProperties = {
    padding: '8px 16px', borderRadius: '6px', border: 'none', color: 'var(--card-bg)', fontWeight: 500, cursor: 'pointer'
};

export default CashflowLayout;
