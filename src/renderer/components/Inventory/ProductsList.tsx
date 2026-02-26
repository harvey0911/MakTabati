import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../services/api';
import { PackageSearch, AlertTriangle, Plus, X } from 'lucide-react';

const ProductsList = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    
    const [newProduct, setNewProduct] = useState({
        name: '',
        sku: '',
        unit: 'pcs',
        cost_price: 0,
        sell_price: 0,
        reorder_level: 10
    });

    const fetchProducts = async () => {
        try {
            const data = await inventoryApi.getProducts();
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAdjustStock = async (product_id: number) => {
        const qtyStr = prompt("Enter adjustment amount (+ for adding, - for removing):");
        if (!qtyStr) return;
        const qty = parseInt(qtyStr, 10);
        if (isNaN(qty)) return alert("Invalid amount");

        const reason = prompt("Enter reason for adjustment (e.g., lost, stock count correction):") || "Manual Adjustment";

        try {
            await inventoryApi.recordMovement({
                product_id: product_id,
                location_id: 1, 
                type: 'ADJUSTMENT',
                quantity: qty,
                created_by: 'Admin',
                note: reason
            });
            await fetchProducts();
        } catch (error) {
            console.error(error);
            alert("Failed to adjust stock");
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await inventoryApi.addProduct(newProduct);
            setShowAddModal(false);
            setNewProduct({ name: '', sku: '', unit: 'pcs', cost_price: 0, sell_price: 0, reorder_level: 10 });
            await fetchProducts();
        } catch (error) {
            console.error(error);
            alert("Failed to add product");
        }
    };

    if (loading) return <div>Loading products...</div>;

    return (
        <div className="card" style={{ padding: '1.5rem', marginTop: '1rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Product Catalog & Inventory</h3>
                <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', backgroundColor: '#4f46e5',
                        color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer'
                    }}>
                    <Plus size={16} /> Add Product
                </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '12px' }}>Product</th>
                        <th style={{ padding: '12px' }}>SKU</th>
                        <th style={{ padding: '12px' }}>Current Stock</th>
                        <th style={{ padding: '12px' }}>Status</th>
                        <th style={{ padding: '12px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <PackageSearch size={48} style={{ margin: '0 auto', opacity: 0.5 }} />
                                <p>No products found.</p>
                            </td>
                        </tr>
                    ) : products.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', fontWeight: 500 }}>{p.name}</td>
                            <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{p.sku || '-'}</td>
                            <td style={{ padding: '12px' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>{p.total_stock}</span> {p.unit}
                            </td>
                            <td style={{ padding: '12px' }}>
                                {p.total_stock <= p.reorder_level ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.875rem' }}>
                                        <AlertTriangle size={14} /> Low Stock
                                    </span>
                                ) : (
                                    <span style={{ color: '#10b981', fontSize: '0.875rem' }}>Healthy</span>
                                )}
                            </td>
                            <td style={{ padding: '12px' }}>
                                <button
                                    onClick={() => handleAdjustStock(p.id)}
                                    style={{
                                        padding: '6px 12px', borderRadius: '6px',
                                        border: '1px solid #e2e8f0', backgroundColor: 'var(--background)',
                                        cursor: 'pointer', fontSize: '0.875rem'
                                    }}>
                                    Adjust Stock
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {}
            {showAddModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Add New Product</h2>
                            <button onClick={() => setShowAddModal(false)} style={closeBtnStyle}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Product Name</label>
                                <input required type="text" style={inputStyle} value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>SKU / Barcode</label>
                                    <input type="text" style={inputStyle} value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Unit (e.g., pcs, box)</label>
                                    <input type="text" style={inputStyle} value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Cost Price</label>
                                    <input type="number" step="0.01" style={inputStyle} value={newProduct.cost_price} onChange={e => setNewProduct({ ...newProduct, cost_price: parseFloat(e.target.value) })} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Sell Price</label>
                                    <input type="number" step="0.01" style={inputStyle} value={newProduct.sell_price} onChange={e => setNewProduct({ ...newProduct, sell_price: parseFloat(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Reorder Level (Alert threshold)</label>
                                <input type="number" style={inputStyle} value={newProduct.reorder_level} onChange={e => setNewProduct({ ...newProduct, reorder_level: parseInt(e.target.value, 10) })} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowAddModal(false)} style={cancelBtnStyle}>Cancel</button>
                                <button type="submit" style={submitBtnStyle}>Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
};

const modalContentStyle: React.CSSProperties = {
    backgroundColor: 'var(--card-bg)',
    borderRadius: '12px',
    padding: '2rem',
    width: '100%',
    maxWidth: '500px',
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
    padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5',
    color: 'var(--card-bg)', fontWeight: 500, cursor: 'pointer'
};

export default ProductsList;
