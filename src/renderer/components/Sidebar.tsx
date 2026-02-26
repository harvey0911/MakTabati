import React from 'react';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    History,
    Library
} from 'lucide-react';

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    const menuItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { id: 'orders', icon: <ShoppingCart size={20} />, label: 'Orders' },
        { id: 'inventory', icon: <Package size={20} />, label: 'Inventory' },
        { id: 'cashflow', icon: <History size={20} />, label: 'Cashflow' },
    ];

    return (
        <div style={sidebarStyle}>
            <div style={logoStyle}>
                <div style={logoIconStyle}>
                    <Library size={20} color="white" />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)' }}>MakTabati</span>
            </div>

            <nav style={navStyle}>
                <div style={sectionTitleStyle}>MAIN MENU</div>
                {menuItems.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                        <div
                            key={item.id}
                            style={isActive ? activeItemStyle : itemStyle}
                            onClick={() => setActiveView(item.id)}
                        >
                            <span style={isActive ? { color: 'white' } : { color: 'var(--text-muted)' }}>{item.icon}</span>
                            <span style={isActive ? { color: 'white', marginLeft: '12px', fontWeight: '500' } : { color: 'var(--text-muted)', marginLeft: '12px', fontWeight: '500' }}>{item.label}</span>
                        </div>
                    );
                })}
            </nav>
        </div>
    );
};

const sidebarStyle: React.CSSProperties = {
    width: '260px',
    backgroundColor: 'var(--sidebar-bg)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    height: '100vh',
    position: 'sticky',
    top: 0,
};

const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '2.5rem',
};

const logoIconStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    backgroundColor: '#111827',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const navStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
};

const sectionTitleStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    marginBottom: '8px',
    paddingLeft: '12px',
};

const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
};

const activeItemStyle: React.CSSProperties = {
    ...itemStyle,
    backgroundColor: '#4f46e5',
    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
};

export default Sidebar;
