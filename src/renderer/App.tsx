import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCard from './components/StatsCard';
import { SalesChart } from './components/Charts';
import InventoryLayout from './components/Inventory/InventoryLayout';
import OrdersLayout from './components/Orders/OrdersLayout';
import CashflowLayout from './components/Cashflow/CashflowLayout';
import { DollarSign, Package, ShoppingCart } from 'lucide-react';
import { inventoryApi } from './services/api';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [stats, setStats] = useState({ total_revenue: 0, total_products: 0, total_orders: 0 });

  useEffect(() => {
    if (activeView === 'dashboard') {
      inventoryApi.getDashboardStats().then(setStats).catch(console.error);
    }
  }, [activeView]);

  return (
    <div className="dashboard-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="main-content">
        <Header />

        {activeView === 'dashboard' && (
          <>
            <div style={statsGridStyle}>
              <StatsCard
                title="Total Revenue"
                value={`$${stats.total_revenue.toFixed(2)}`}
                trend=""
                isUp={true}
                icon={<DollarSign size={20} />}
              />
              <StatsCard
                title="Total Products"
                value={stats.total_products.toString()}
                trend=""
                isUp={true}
                icon={<Package size={20} />}
              />
              <StatsCard
                title="Total Orders"
                value={stats.total_orders.toString()}
                trend=""
                isUp={true}
                icon={<ShoppingCart size={20} />}
              />
            </div>

            <div style={chartsRowStyle}>
              <SalesChart />
            </div>
          </>
        )}

        {activeView === 'inventory' && (
          <InventoryLayout />
        )}

        {activeView === 'orders' && (
          <OrdersLayout />
        )}

        {activeView === 'cashflow' && (
          <CashflowLayout />
        )}

      </main>
    </div>
  );
}

const statsGridStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1.5rem',
  flexWrap: 'wrap',
  marginBottom: '2rem',
};

const chartsRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1.5rem',
  flexWrap: 'wrap',
};

export default App;
