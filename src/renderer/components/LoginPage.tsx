import React, { useState } from 'react';
import { Lock, LogIn, ShieldCheck } from 'lucide-react';
import { inventoryApi } from '../services/api';

interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await inventoryApi.login(password);
            localStorage.setItem('isLoggedIn', 'true');
            onLogin();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={headerStyle}>
                    <div style={iconBgStyle}>
                        <ShieldCheck size={32} color="#4f46e5" />
                    </div>
                    <h1 style={titleStyle}>MakTabati</h1>
                    <p style={subtitleStyle}>Library Management System</p>
                </div>

                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={inputGroupStyle}>
                        <div style={iconWrapperStyle}>
                            <Lock size={18} color="#94a3b8" />
                        </div>
                        <input
                            type="password"
                            placeholder="Enter Admin Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={inputStyle}
                            required
                        />
                    </div>

                    {error && <div style={errorStyle}>{error}</div>}

                    <button type="submit" disabled={loading} style={btnStyle}>
                        {loading ? 'Authenticating...' : (
                            <>
                                <LogIn size={20} />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <div style={footerStyle}>
                    <p style={footerTextStyle}>Default password is <strong>admin</strong></p>
                </div>
            </div>

            <div style={bgDecorationStyle}></div>
        </div>
    );
};

const containerStyle: React.CSSProperties = {
    height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f8fafc', position: 'relative', overflow: 'hidden'
};

const cardStyle: React.CSSProperties = {
    backgroundColor: 'white', padding: '3rem 2.5rem', borderRadius: '24px', width: '100%', maxWidth: '420px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    zIndex: 10, position: 'relative'
};

const headerStyle: React.CSSProperties = {
    textAlign: 'center', marginBottom: '2.5rem'
};

const iconBgStyle: React.CSSProperties = {
    width: '64px', height: '64px', backgroundColor: '#eef2ff', borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
};

const titleStyle: React.CSSProperties = {
    fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.5rem'
};

const subtitleStyle: React.CSSProperties = {
    color: '#64748b', margin: 0, fontSize: '0.875rem'
};

const formStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '1.5rem'
};

const inputGroupStyle: React.CSSProperties = {
    position: 'relative', display: 'flex', alignItems: 'center'
};

const iconWrapperStyle: React.CSSProperties = {
    position: 'absolute', left: '16px'
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid #e2e8f0',
    fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', color: '#1e293b'
};

const errorStyle: React.CSSProperties = {
    color: '#ef4444', fontSize: '0.875rem', textAlign: 'center', backgroundColor: '#fef2f2',
    padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2'
};

const btnStyle: React.CSSProperties = {
    backgroundColor: '#4f46e5', color: 'white', padding: '12px', borderRadius: '12px', border: 'none',
    fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '8px', transition: 'all 0.2s'
};

const footerStyle: React.CSSProperties = {
    marginTop: '2rem', textAlign: 'center'
};

const footerTextStyle: React.CSSProperties = {
    color: '#94a3b8', fontSize: '0.75rem', margin: 0
};

const bgDecorationStyle: React.CSSProperties = {
    position: 'absolute', width: '150%', height: '150%', backgroundColor: '#4f46e5',
    transform: 'rotate(-45deg)', top: '10%', right: '-80%', opacity: 0.05, borderRadius: '20%'
};

export default LoginPage;
