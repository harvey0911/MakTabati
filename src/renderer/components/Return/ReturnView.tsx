import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../services/api';
import { Plus, Minus, Trash2, Search, RotateCcw, Package } from 'lucide-react';
import Modal from '../Modal';

interface Product {
    id: number;
    name: string;
    sku: string;
    cost_price: number;
    sell_price: number;
    total_stock: number;
}

interface CartItem {
    product: Product;
    quantity: number;
}

const ReturnView = ({ onComplete }: { onComplete: () => void }) => {
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await inventoryApi.getProducts();
                setAvailableProducts(data.filter((p: any) => p.active !== false));
            } catch (error) {
                console.error("Failed to fetch products", error);
            }
        };
        fetchProducts();
    }, []);

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.product.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId: number, newQty: number) => {
        if (newQty <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(cart.map(item => item.product.id === productId ? { ...item, quantity: newQty } : item));
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.product.sell_price), 0);

    const filteredProducts = availableProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSubmit = async () => {
        if (cart.length === 0) return showAlert('Information', 'Cart is empty.', 'info');

        setIsSubmitting(true);
        try {
            const returnData = {
                note: note,
                total_amount: totalAmount,
                items: cart.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    unit_price: item.product.sell_price
                }))
            };

            await inventoryApi.recordReturn(returnData);

            showAlert('Success', 'Return recorded successfully!', 'success', () => {
                onComplete();
            });
        } catch (error) {
            console.error(error);
            showAlert('Error', 'Failed to process return.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 120px)', padding: '0.5rem' }}>
            {/* Product Selection */}
            <div className="card" style={{ flex: 7, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '8px', backgroundColor: '#fff7ed', borderRadius: '8px' }}>
                        <Package size={20} color="#f97316" />
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Select'Product to Return</h3>
                </div>

                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' }}
                    />
                </div>

                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                        {filteredProducts.map(p => (
                            <div
                                key={p.id}
                                onClick={() => addToCart(p)}
                                style={{
                                    padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px',
                                    cursor: 'pointer', transition: 'all 0.2s', backgroundColor: 'var(--background)',
                                    display: 'flex', flexDirection: 'column', gap: '10px'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#f97316'; }}
                                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                            >
                                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem' }}>{p.name}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8125rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                                        Stock: {p.total_stock}
                                    </span>
                                    <span style={{ fontWeight: 700, color: '#f97316' }}>${p.sell_price.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart & Summary */}
            <div className="card" style={{ flex: 5, padding: '1.5rem', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '8px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                        <RotateCcw size={20} color="#ef4444" />
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Items to Return</h3>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '4px' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '4rem' }}>
                            <RotateCcw size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                            <p>No items added to return yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {cart.map(item => (
                                <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.product.name}</div>
                                        <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>${item.product.sell_price.toFixed(2)} / each</div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                                            <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={qtyBtnStyle}><Minus size={14} /></button>
                                            <span style={{ fontWeight: 600, minWidth: '32px', textAlign: 'center', color: '#1e293b' }}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={qtyBtnStyle}><Plus size={14} /></button>
                                        </div>

                                        <button onClick={() => removeFromCart(item.product.id)} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: '#fee2e2', color: '#ef4444', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: 'auto', backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Notes</label>
                        <textarea
                            placeholder="Add note for this return..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.875rem', minHeight: '60px', resize: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'baseline' }}>
                        <span style={{ color: '#64748b', fontWeight: 500 }}>Refund Amount:</span>
                        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ef4444' }}>${totalAmount.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={cart.length === 0 || isSubmitting}
                        style={{
                            width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                            backgroundColor: cart.length === 0 ? '#cbd5e1' : '#ef4444',
                            color: 'white', fontWeight: 600, fontSize: '1.05rem', cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                        }}>
                        {isSubmitting ? 'Processing...' : 'Complete Return'}
                    </button>
                </div>
            </div>

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

const qtyBtnStyle: React.CSSProperties = {
    padding: '8px', border: 'none', backgroundColor: 'transparent',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#475569', transition: 'background-color 0.2s'
};

export default ReturnView;
