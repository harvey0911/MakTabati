import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string;
    trend: string;
    isUp: boolean;
    icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, isUp, icon }) => {
    return (
        <div className="card" style={cardStyle}>
            <div style={headerStyle}>
                <div style={iconContainerStyle}>
                    {icon}
                </div>
            </div>

            <div style={contentStyle}>
                <span style={titleStyle}>{title}</span>
                <div style={valueRowStyle}>
                    <h2 style={valueStyle}>{value}</h2>
                    <div style={{
                        ...trendBadgeStyle,
                        backgroundColor: isUp ? '#ecfdf5' : '#fef2f2',
                        color: isUp ? '#10b981' : '#ef4444'
                    }}>
                        {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        <span>{trend}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const cardStyle: React.CSSProperties = {
    padding: '1.5rem',
    flex: 1,
    minWidth: '240px',
};

const headerStyle: React.CSSProperties = {
    marginBottom: '1rem',
};

const iconContainerStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'var(--background)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
};

const contentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
};

const titleStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
};

const valueRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '4px',
};

const valueStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-main)',
};

const trendBadgeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
};

export default StatsCard;
