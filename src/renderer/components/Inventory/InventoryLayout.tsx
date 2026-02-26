import React, { useState } from 'react';
import ProductsList from './ProductsList';
import StockMovementsList from './StockMovementsList';
import LowStockList from './LowStockList';

const InventoryLayout = () => {
    const [activeTab, setActiveTab] = useState('products');

    return (
        <div style={{ width: '100%' }}>

            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setActiveTab('products')}
                    style={activeTab === 'products' ? activeTabStyle : tabStyle}
                >
                    Products & Stock
                </button>
                <button
                    onClick={() => setActiveTab('movements')}
                    style={activeTab === 'movements' ? activeTabStyle : tabStyle}
                >
                    Stock Movements
                </button>
                <button
                    onClick={() => setActiveTab('low-stock')}
                    style={activeTab === 'low-stock' ? activeTabStyle : tabStyle}
                >
                    Low Stock Alerts
                </button>
            </div>

            <div style={{ width: '100%' }}>
                {activeTab === 'products' && <ProductsList />}
                {activeTab === 'movements' && <StockMovementsList />}
                {activeTab === 'low-stock' && <LowStockList />}
            </div>
        </div>
    );
};

const tabStyle: React.CSSProperties = {
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'var(--text-muted)',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: '0.9rem'
};

const activeTabStyle: React.CSSProperties = {
    ...tabStyle,
    borderBottom: '2px solid #4f46e5',
    color: '#4f46e5',
};


export default InventoryLayout;
