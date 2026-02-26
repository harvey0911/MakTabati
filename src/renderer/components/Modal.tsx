import React from 'react';
import { X, AlertCircle, CheckCircle, Info, HelpCircle } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'error' | 'confirm';
    onConfirm?: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, message, type = 'info', onConfirm }) => {
    if (!isOpen) return null;

    const colors = {
        info: '#3b82f6',
        success: '#10b981',
        error: '#ef4444',
        confirm: '#6366f1'
    };

    const icons = {
        info: <Info size={48} color={colors.info} />,
        success: <CheckCircle size={48} color={colors.success} />,
        error: <AlertCircle size={48} color={colors.error} />,
        confirm: <HelpCircle size={48} color={colors.confirm} />
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h2 style={titleStyle}>{title}</h2>
                    <button onClick={onClose} style={closeBtnStyle}>
                        <X size={20} />
                    </button>
                </div>

                <div style={bodyStyle}>
                    <div style={iconContainerStyle}>
                        {icons[type]}
                    </div>
                    <p style={messageStyle}>{message}</p>
                </div>

                <div style={footerStyle}>
                    {type === 'confirm' ? (
                        <>
                            <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
                            <button onClick={() => { onConfirm?.(); onClose(); }} style={confirmBtnStyle}>Confirm</button>
                        </>
                    ) : (
                        <button onClick={onClose} style={{ ...confirmBtnStyle, backgroundColor: colors[type] }}>OK</button>
                    )}
                </div>
            </div>
        </div>
    );
};

const overlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const modalStyle: React.CSSProperties = {
    backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: '400px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
};

const headerStyle: React.CSSProperties = {
    padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: '1px solid #f1f5f9'
};

const titleStyle: React.CSSProperties = {
    margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#1e293b'
};

const closeBtnStyle: React.CSSProperties = {
    background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px'
};

const bodyStyle: React.CSSProperties = {
    padding: '2rem 1.5rem', textAlign: 'center'
};

const iconContainerStyle: React.CSSProperties = {
    marginBottom: '1rem', display: 'flex', justifyContent: 'center'
};

const messageStyle: React.CSSProperties = {
    margin: 0, color: '#475569', lineHeight: 1.5
};

const footerStyle: React.CSSProperties = {
    padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
    backgroundColor: '#f8fafc'
};

const btnBase: React.CSSProperties = {
    padding: '0.625rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', border: 'none',
    transition: 'all 0.2s'
};

const cancelBtnStyle: React.CSSProperties = {
    ...btnBase, backgroundColor: 'white', color: '#64748b', border: '1px solid #e2e8f0'
};

const confirmBtnStyle: React.CSSProperties = {
    ...btnBase, backgroundColor: '#6366f1', color: 'white'
};

export default Modal;
