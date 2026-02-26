import React, { useState } from 'react';
import OrdersList from './OrdersList';
import CreateOrder from './CreateOrder';

const OrdersLayout = () => {
    const [view, setView] = useState<'list' | 'create'>('list');

    return (
        <div style={{ width: '100%' }}>
            {view === 'list' && (
                <OrdersList onNewOrder={() => setView('create')} />
            )}

            {view === 'create' && (
                <CreateOrder
                    onBack={() => setView('list')}
                    onOrderCreated={() => setView('list')}
                />
            )}
        </div>
    );
};

export default OrdersLayout;
