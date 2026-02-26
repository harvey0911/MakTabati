import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCard from './components/StatsCard';
import { SalesChart } from './components/Charts';
import InventoryLayout from './components/Inventory/InventoryLayout';
import OrdersLayout from './components/Orders/OrdersLayout';
import CashflowLayout from './components/Cashflow/CashflowLayout';
import Settings from './components/Settings';
import LoginPage from './components/LoginPage';
import SellView from './components/Sell/SellView';
import ReturnView from './components/Return/ReturnView';
import { DollarSign, Package, ShoppingCart, RotateCcw } from 'lucide-react';
import { inventoryApi } from './services/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [activeView, setActiveView] = useState('dashboard');
  const [stats, setStats] = useState({ total_revenue: 0, total_products: 0, total_orders: 0 });

  useEffect(() => {
    if (isLoggedIn && activeView === 'dashboard') {
      inventoryApi.getDashboardStats().then(setStats).catch(console.error);
    }
  }, [activeView, isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="dashboard-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} onLogout={handleLogout} />

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
          <CashflowLayout
            onNavigateToSell={() => setActiveView('sell')}
            onNavigateToReturn={() => setActiveView('return')}
          />
        )}

        {activeView === 'sell' && (
          <SellView onComplete={() => setActiveView('cashflow')} />
        )}

        {activeView === 'return' && (
          <ReturnView onComplete={() => setActiveView('cashflow')} />
        )}

        {activeView === 'settings' && (
          <Settings />
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
