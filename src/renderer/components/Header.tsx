import React, { useState, useEffect } from 'react';
import { Search, Bell, ChevronDown, Moon, Sun } from 'lucide-react';

const Header = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (document.documentElement.classList.contains('dark')) {
            setIsDark(true);
        }
    }, []);

    const toggleDarkMode = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <div style={headerStyle}>
            <h1 style={titleStyle}>Dashboard</h1>

            <div style={actionsStyle}>
                <div style={searchContainerStyle}>
                    <Search size={18} style={searchIconStyle} />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        style={searchInputStyle}
                    />
                </div>

                <div style={iconButtonStyle} onClick={toggleDarkMode}>
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </div>

                <div style={iconButtonStyle}>
                    <Bell size={20} />
                    <div style={badgeStyle}>3</div>
                </div>
            </div>
        </div>
    );
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem',
};

const titleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-main)',
};

const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
};

const searchContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
};

const searchIconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)',
};

const searchInputStyle: React.CSSProperties = {
    padding: '10px 16px 10px 40px',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--card-bg)',
    color: 'var(--text-main)',
    width: '300px',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
};

const iconButtonStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    color: 'var(--text-muted)',
};

const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#4f46e5',
    color: 'white',
    fontSize: '0.7rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--background)',
};



export default Header;
