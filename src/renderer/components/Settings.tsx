import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Database, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { inventoryApi } from '../services/api';
import Modal from './Modal';

const Settings: React.FC = () => {
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [clearDbPassword, setClearDbPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Modal state
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, title: string, message: string, type: 'info' | 'success' | 'error' | 'confirm', onConfirm?: () => void }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const showAlert = (title: string, message: string, type: 'info' | 'success' | 'error' | 'confirm' = 'info', onConfirm?: () => void) => {
        setModalConfig({ isOpen: true, title, message, type, onConfirm });
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return showAlert('Error', 'New passwords do not match', 'error');
        }

        setLoading(true);
        try {
            await inventoryApi.changePassword({ oldPassword: passwords.oldPassword, newPassword: passwords.newPassword });
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            showAlert('Success', 'Password changed successfully!', 'success');
        } catch (err: any) {
            showAlert('Error', err.response?.data?.error || 'Failed to change password', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClearDatabase = async (e: React.FormEvent) => {
        e.preventDefault();
        showAlert(
            'Dangerous Action',
            'Are you sure you want to clear the entire database? This action is permanent and cannot be undone.',
            'confirm',
            async () => {
                setLoading(true);
                try {
                    await inventoryApi.clearDatabase(clearDbPassword);
                    setClearDbPassword('');
                    showAlert('Success', 'Database cleared successfully!', 'success');
                } catch (err: any) {
                    showAlert('Error', err.response?.data?.error || 'Failed to clear database', 'error');
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <SettingsIcon size={24} color="#4f46e5" />
                <h2 style={titleStyle}>System Settings</h2>
            </div>

            <div style={gridStyle}>
                {/* Change Password Section */}
                <div className="card" style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <Shield size={20} color="#4f46e5" />
                        <h3 style={cardTitleStyle}>Security & Authentication</h3>
                    </div>
                    <p style={cardDescStyle}>Keep your account secure by updating your administrator password.</p>

                    <form onSubmit={handleChangePassword} style={formStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Current Password</label>
                            <input
                                type="password"
                                value={passwords.oldPassword}
                                onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>New Password</label>
                            <input
                                type="password"
                                value={passwords.newPassword}
                                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Confirm New Password</label>
                            <input
                                type="password"
                                value={passwords.confirmPassword}
                                onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                style={inputStyle}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} style={btnStyle}>
                            Change Password
                        </button>
                    </form>
                </div>

                {/* Database Management Section */}
                <div className="card" style={{ ...cardStyle, borderColor: '#fee2e2' }}>
                    <div style={cardHeaderStyle}>
                        <Database size={20} color="#ef4444" />
                        <h3 style={{ ...cardTitleStyle, color: '#ef4444' }}>Database Maintenance</h3>
                    </div>
                    <p style={cardDescStyle}>Use these tools to manage your system data. <strong>Warning:</strong> Actions here are irreversible.</p>

                    <form onSubmit={handleClearDatabase} style={formStyle}>
                        <div style={{ ...inputGroupStyle, marginTop: 'auto' }}>
                            <label style={labelStyle}>Administrator Password (Required)</label>
                            <input
                                type="password"
                                value={clearDbPassword}
                                onChange={e => setClearDbPassword(e.target.value)}
                                style={{ ...inputStyle, borderColor: '#fca5a5' }}
                                placeholder="Enter password to confirm"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !clearDbPassword}
                            style={{ ...btnStyle, backgroundColor: '#ef4444' }}
                        >
                            Reset All Operational Data
                        </button>
                    </form>
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

const containerStyle: React.CSSProperties = {
    padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '2rem'
};

const headerStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem'
};

const titleStyle: React.CSSProperties = {
    margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1e293b'
};

const gridStyle: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem'
};

const cardStyle: React.CSSProperties = {
    padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #e2e8f0'
};

const cardHeaderStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '10px'
};

const cardTitleStyle: React.CSSProperties = {
    margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#1e293b'
};

const cardDescStyle: React.CSSProperties = {
    margin: 0, fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5
};

const formStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '1.25rem'
};

const inputGroupStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '6px'
};

const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem', fontWeight: 500, color: '#475569'
};

const inputStyle: React.CSSProperties = {
    padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.925rem',
    outline: 'none', transition: 'all 0.2s', backgroundColor: '#fdfdfd'
};

const btnStyle: React.CSSProperties = {
    padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#4f46e5', color: 'white',
    fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'opacity 0.2s'
};

export default Settings;
