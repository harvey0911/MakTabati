import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const inventoryApi = {

    getProducts: async () => {
        const response = await api.get('/inventory/products');
        return response.data;
    },
    addProduct: async (productData: any) => {
        const response = await api.post('/inventory/products', productData);
        return response.data;
    },


    getMovements: async () => {
        const response = await api.get('/inventory/movements');
        return response.data;
    },
    recordMovement: async (movementData: any) => {
        const response = await api.post('/inventory/movement', movementData);
        return response.data;
    },


    getLowStock: async () => {
        const response = await api.get('/inventory/low-stock');
        return response.data;
    },


    getOrders: async () => {
        const response = await api.get('/orders');
        return response.data;
    },
    createOrder: async (orderData: any) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },
    completeOrder: async (id: number) => {
        const response = await api.put(`/orders/${id}/complete`);
        return response.data;
    },


    getTransactions: async () => {
        const response = await api.get('/cashflow/transactions');
        return response.data;
    },
    recordTransaction: async (transactionData: any) => {
        const response = await api.post('/cashflow/transaction', transactionData);
        return response.data;
    },


    getDashboardSales: async () => {
        const response = await api.get('/dashboard/sales');
        return response.data;
    },
    getDashboardStats: async () => {
        const response = await api.get('/dashboard/stats');
        return response.data;
    },

    // Auth & Settings
    login: async (password: string) => {
        const response = await api.post('/login', { password });
        return response.data;
    },
    changePassword: async (passwords: any) => {
        const response = await api.post('/settings/change-password', passwords);
        return response.data;
    },
    clearDatabase: async (password: string) => {
        const response = await api.post('/settings/clear-database', { password });
        return response.data;
    },
    recordSale: async (saleData: { items: any[], total_amount: number, note?: string }) => {
        const response = await api.post('/sales', saleData);
        return response.data;
    },
    recordReturn: async (returnData: { items: any[], total_amount: number, note?: string }) => {
        const response = await api.post('/returns', returnData);
        return response.data;
    }
};

export default api;
