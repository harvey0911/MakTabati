import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Calendar, ChevronDown, MoreVertical } from 'lucide-react';
import { inventoryApi } from '../services/api';

const countryData = [
    { name: 'USA', value: 29 },
    { name: 'Russia', value: 20 },
    { name: 'Asia', value: 14 },
    { name: 'Africa', value: 10 },
    { name: 'Australia', value: 8 },
];

const salesData = [
    { name: 'Sat', sales: 3000 },
    { name: 'Sun', sales: 5000 },
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 7000 },
    { name: 'Wed', sales: 4500 },
    { name: 'Thu', sales: 5500 },
    { name: 'Fri', sales: 5000 },
];

export const CountryChart = () => (
    <div className="card" style={chartCardStyle}>
        <div style={chartHeaderStyle}>
            <h3 style={chartTitleStyle}>Country Redistribution</h3>
            <div style={selectStyle}>
                <Calendar size={14} />
                <span>Yearly</span>
                <ChevronDown size={14} />
            </div>
        </div>
        <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    layout="vertical"
                    data={countryData}
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export const SalesChart = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const salesData = await inventoryApi.getDashboardSales();
                setData(salesData);
            } catch (error) {
                console.error("Failed to fetch dashboard sales", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, []);

    if (loading) return (
        <div className="card" style={{ flex: 2, padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Loading chart data...
        </div>
    );

    return (
        <div className="card" style={{ flex: 2, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Total Sales (Last 7 Days)</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Weekly Trend</span>
                </div>
            </div>

            <div style={{ width: '100%', height: 250 }}>
                {data.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        No sales data available.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="sales"
                                stroke="#4f46e5"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorSales)"
                                activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

const chartCardStyle: React.CSSProperties = {
    padding: '1.5rem',
    flex: 1,
};

const chartHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
};

const chartTitleStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: 'var(--text-main)',
};

const subtitleStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
};

const selectStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    cursor: 'pointer',
};

const iconButtonStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    cursor: 'pointer',
};
