import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../services/api';
import { Plus, Minus, Trash2, ArrowLeft, X, ShoppingBag } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

const SellView = ({ onBack, onSaleRecorded }: { onBack: () => void, onSaleRecorded: () => void }) => {
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
                setAvailableProducts(data.filter((p: any) => p.active));
            } catch (error) {
                console.error("Failed to fetch products", error);
            }
        };
        fetchProducts();
    }, []);

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.product.id === product.id);
        if (existing) {
            if (existing.quantity + 1 > product.total_stock) {
                return showAlert('Low Stock', `Cannot sell more than available stock (${product.total_stock})`, 'error');
            }
            setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            if (product.total_stock < 1) {
                return showAlert('Out of Stock', `Product ${product.name} is out of stock.`, 'error');
            }
            setCart([...cart, { product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId: number, newQty: number) => {
        const item = cart.find(i => i.product.id === productId);
        if (!item) return;

        if (newQty <= 0) {
            removeFromCart(productId);
            return;
        }

        if (newQty > item.product.total_stock) {
            return showAlert('Low Stock', `Cannot sell more than available stock (${item.product.total_stock})`, 'error');
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

    const generateReceipt = (transactionId: number) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('MakTabati', 14, 22);
        doc.setFontSize(14);
        doc.text('Sales Receipt', 14, 32);

        doc.setFontSize(10);
        doc.text(`TX ID: #${transactionId}`, 14, 45);
        doc.text(`Date: ${new Date().toLocaleString()}`, 14, 52);
        doc.text(`Note: ${note || 'N/A'}`, 14, 59);

        const tableData = cart.map(item => [
            item.product.name,
            item.quantity.toString(),
            `$${item.product.sell_price.toFixed(2)}`,
            `$${(item.quantity * item.product.sell_price).toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: 70,
            head: [['Product', 'Qty', 'Unit Price', 'Total']],
            body: tableData,
            foot: [['', '', 'Grand Total:', `$${totalAmount.toFixed(2)}`]],
            footStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' }
        });

        doc.save(`Receipt_${transactionId}.pdf`);
    };

    const handleSubmit = async () => {
        if (cart.length === 0) return showAlert('Information', 'Cart is empty.', 'info');

        setIsSubmitting(true);
        try {
            const saleData = {
                type: 'SALE',
                amount: totalAmount,
                note: note || 'Multi-item Sale',
                created_by: 'Admin',
                items: cart.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    unit_price: item.product.sell_price
                }))
            };

            const response = await inventoryApi.recordTransaction(saleData);

            showAlert(
                'Sale Recorded',
                'Sale recorded successfully! Would you like to download the receipt?',
                'confirm',
                () => generateReceipt(response.transaction_id)
            );

            onSaleRecorded();
        } catch (error) {
            console.error(error);
            showAlert('Error', 'Failed to record sale.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', height: 'calc(100vh - 150px)' }}>
            {/* Product Selection */}
            <div className="card" style={{ flex: 6, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Select Products to Sell</h3>
                </div>

                <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem', outline: 'none' }}
                />

                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {filteredProducts.map(p => (
                            <div
                                key={p.id}
                                onClick={() => addToCart(p)}
                                style={{
                                    padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px',
                                    cursor: 'pointer', transition: 'all 0.2s', backgroundColor: 'var(--background)',
                                    display: 'flex', flexDirection: 'column', gap: '8px',
                                    opacity: p.total_stock < 1 ? 0.6 : 1
                                }}
                                onMouseOver={(e) => p.total_stock >= 1 && (e.currentTarget.style.borderColor = '#10b981')}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                            >
                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</div>
                                <div style={{ fontSize: '0.875rem', color: p.total_stock < 5 ? '#ef4444' : 'var(--text-muted)' }}>
                                    Stock: {p.total_stock} {p.total_stock < 1 && '(Out of stock)'}
                                </div>
                                <div style={{ fontWeight: 600, color: '#10b981', marginTop: 'auto' }}>${p.sell_price.toFixed(2)}</div>
                            </div>
                        ))}
                        {filteredProducts.length === 0 && (
                            <div style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>No products match your search.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cart Section */}
            <div className="card" style={{ flex: 4, padding: '1.5rem', display: 'flex', flexDirection: 'column', backgroundColor: '#fcfcfc' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingBag size={20} color="#10b981" /> Current Sale
                </h3>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '4px' }}>Note (Optional)</label>
                    <input
                        type="text"
                        placeholder="e.g. Walk-in customer..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                </div>

                <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', margin: '1rem 0', padding: '1rem 0' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Cart is empty</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {cart.map(item => (
                                <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{item.product.name}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>${item.product.sell_price.toFixed(2)} / each</div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={qtyBtnStyle}><Minus size={12} /></button>
                                        <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={qtyBtnStyle}><Plus size={12} /></button>

                                        <button onClick={() => removeFromCart(item.product.id)} style={{ ...qtyBtnStyle, marginLeft: '8px', color: '#ef4444' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
                        <span>Total:</span>
                        <span style={{ color: '#10b981' }}>${totalAmount.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={cart.length === 0 || isSubmitting}
                        style={{
                            width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                            backgroundColor: cart.length === 0 ? '#cbd5e1' : '#10b981',
                            color: 'white', fontWeight: 600, fontSize: '1rem', cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                        }}>
                        {isSubmitting ? 'Recording Sale...' : 'Record Sale (Cash In)'}
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
    padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
};

export default SellView;
