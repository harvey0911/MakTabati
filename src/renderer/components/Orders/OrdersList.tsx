import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../services/api';
import { ShoppingBag, FileDown, Plus, ExternalLink, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Modal from '../Modal';

const OrdersList = ({ onNewOrder }: { onNewOrder: () => void }) => {
    const [orders, setOrders] = useState<any[]>([]);
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

    const fetchOrders = async () => {
        try {
            const data = await inventoryApi.getOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCompleteOrder = async (id: number) => {
        showAlert(
            'Confirm Completion',
            'Are you sure you want to mark this order as completed? This will update inventory and cashflow.',
            'confirm',
            async () => {
                try {
                    await inventoryApi.completeOrder(id);
                    fetchOrders();
                    showAlert('Success', 'Order completed successfully!', 'success');
                } catch (error) {
                    console.error("Failed to complete order", error);
                    showAlert('Error', 'Failed to complete order.', 'error');
                }
            }
        );
    };

    const generatePdf = (order: any) => {
        const doc = new jsPDF();


        doc.setFontSize(20);
        doc.text('MakTabati', 14, 22);

        doc.setFontSize(14);
        doc.text('Order Receipt', 14, 32);


        doc.setFontSize(10);
        doc.text(`Order ID: #${order.id}`, 14, 45);
        doc.text(`Date: ${new Date(order.created_at).toLocaleString()}`, 14, 52);
        doc.text(`Customer: ${order.customer_name}`, 14, 59);




        autoTable(doc, {
            startY: 70,
            head: [['Description', 'Value']],
            body: [
                ['Total Items', order.item_count],
                ['Status', order.status],
                ['Total Amount', `$${order.total_amount.toFixed(2)}`]
            ],
        });


        doc.save(`Order_${order.id}.pdf`);
    };


    if (loading) return <div>Loading orders...</div>;

    return (
        <div className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Order History</h3>
                <button
                    onClick={onNewOrder}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', backgroundColor: '#4f46e5',
                        color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontWeight: 500
                    }}>
                    <Plus size={16} /> Create New Order
                </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '12px' }}>Order ID</th>
                        <th style={{ padding: '12px' }}>Date</th>
                        <th style={{ padding: '12px' }}>Customer</th>
                        <th style={{ padding: '12px' }}>Items</th>
                        <th style={{ padding: '12px' }}>Total Amount</th>
                        <th style={{ padding: '12px' }}>Status</th>
                        <th style={{ padding: '12px' }}>Receipt</th>
                        <th style={{ padding: '12px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <ShoppingBag size={48} style={{ margin: '0 auto', opacity: 0.5, marginBottom: '1rem' }} />
                                <p>No orders found. Create your first order!</p>
                            </td>
                        </tr>
                    ) : orders.map(order => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', fontWeight: 600 }}>#{order.id}</td>
                            <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '12px', fontWeight: 500 }}>{order.customer_name}</td>
                            <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{order.item_count} items</td>
                            <td style={{ padding: '12px', fontWeight: 600, color: '#10b981' }}>
                                ${order.total_amount.toFixed(2)}
                            </td>
                            <td style={{ padding: '12px' }}>
                                <span style={{
                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                    backgroundColor: '#ecfdf5', color: '#10b981'
                                }}>
                                    {order.status}
                                </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                                <button
                                    onClick={() => generatePdf(order)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '6px 12px', borderRadius: '6px',
                                        border: '1px solid var(--border)', backgroundColor: 'var(--card-bg)',
                                        cursor: 'pointer', fontSize: '0.875rem', color: '#4f46e5',
                                        fontWeight: 500
                                    }}>
                                    <FileDown size={14} /> PDF
                                </button>
                            </td>
                            <td style={{ padding: '12px' }}>
                                {order.status === 'PENDING' && (
                                    <button
                                        onClick={() => handleCompleteOrder(order.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '6px 12px', borderRadius: '6px',
                                            border: '1px solid var(--border)', backgroundColor: 'var(--card-bg)',
                                            cursor: 'pointer', fontSize: '0.875rem', color: '#10b981',
                                            fontWeight: 500
                                        }}>
                                        <CheckCircle size={14} /> Complete
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
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

export default OrdersList;
