import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Maktabati Backend is running' });
});








app.get('/api/inventory/products', (req, res) => {
    const query = `
        SELECT p.*, COALESCE(SUM(i.quantity_on_hand), 0) as total_stock
        FROM Product p
        LEFT JOIN InventoryStock i ON p.id = i.product_id
        GROUP BY p.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});


app.post('/api/inventory/products', (req, res) => {
    const { name, sku, category_id, unit, cost_price, sell_price, reorder_level } = req.body;
    const finalSku = sku && sku.trim() !== '' ? sku.trim() : null;
    const query = `INSERT INTO Product (name, sku, category_id, unit, cost_price, sell_price, reorder_level) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [name, finalSku, category_id, unit, cost_price, sell_price, reorder_level], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});




app.post('/api/inventory/movement', (req, res) => {
    const { product_id, location_id, type, quantity, unit_cost, reference_type, reference_id, created_by, note } = req.body;

    
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const insertMovement = `
            INSERT INTO StockMovement 
            (product_id, location_id, type, quantity, unit_cost, reference_type, reference_id, created_by, note)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(insertMovement, [product_id, location_id, type, quantity, unit_cost, reference_type, reference_id, created_by, note], function (err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to record movement: ' + err.message });
            }

            
            
            const upsertStock = `
                INSERT INTO InventoryStock (product_id, location_id, quantity_on_hand)
                VALUES (?, ?, ?)
                ON CONFLICT(product_id, location_id) DO UPDATE SET
                quantity_on_hand = quantity_on_hand + EXCLUDED.quantity_on_hand
            `;

            db.run(upsertStock, [product_id, location_id, quantity], function (stockErr) {
                if (stockErr) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Failed to update stock: ' + stockErr.message });
                }

                db.run('COMMIT');
                res.json({ success: true, message: 'Stock updated successfully' });
            });
        });
    });
});


app.get('/api/inventory/movements', (req, res) => {
    const query = `
        SELECT m.*, p.name as product_name, l.name as location_name 
        FROM StockMovement m
        JOIN Product p ON m.product_id = p.id
        JOIN StockLocation l ON m.location_id = l.id
        ORDER BY m.created_at DESC
        LIMIT 100
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});




app.get('/api/inventory/low-stock', (req, res) => {
    const query = `
        SELECT p.*, COALESCE(SUM(i.quantity_on_hand), 0) as total_stock
        FROM Product p
        LEFT JOIN InventoryStock i ON p.id = i.product_id
        GROUP BY p.id
        HAVING total_stock <= p.reorder_level
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});






app.get('/api/orders', (req, res) => {
    const query = `
        SELECT o.*, COUNT(oi.id) as item_count
        FROM OrderTable o
        LEFT JOIN OrderItem oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

const runQuery = (query: string, params: any[] = []): Promise<any> => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const getQuery = (query: string, params: any[] = []): Promise<any> => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const allQuery = (query: string, params: any[] = []): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};


app.post('/api/orders', async (req, res) => {
    const { customer_name, total_amount, items } = req.body;
    

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain items' });
    }

    try {
        await runQuery('BEGIN TRANSACTION');

        const orderResult = await runQuery(`INSERT INTO OrderTable (customer_name, total_amount, status) VALUES (?, ?, 'PENDING')`, [customer_name || 'Walk-in Customer', total_amount]);
        const orderId = orderResult.lastID;

        for (const item of items) {
            await runQuery(`INSERT INTO OrderItem (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`, [orderId, item.product_id, item.quantity, item.unit_price]);
        }

        await runQuery('COMMIT');
        res.json({ success: true, message: 'Order created successfully (Pending)', order_id: orderId });
    } catch (err: any) {
        try { await runQuery('ROLLBACK'); } catch (e) {  }
        res.status(500).json({ error: 'Failed to process order: ' + err.message });
    }
});


app.put('/api/orders/:id/complete', async (req, res) => {
    const orderId = req.params.id;

    try {
        await runQuery('BEGIN TRANSACTION');

        const order = await getQuery(`SELECT * FROM OrderTable WHERE id = ?`, [orderId]);
        if (!order || order.status === 'COMPLETED') {
            await runQuery('ROLLBACK');
            return res.status(400).json({ error: 'Order not found or already completed' });
        }

        
        await runQuery(`INSERT INTO TransactionLog (type, amount, order_id, note) VALUES (?, ?, ?, ?)`, ['EXPENSE', order.total_amount, orderId, `Purchase from Supplier (Order #${orderId})`]);

        
        const items = await allQuery(`SELECT * FROM OrderItem WHERE order_id = ?`, [orderId]);
        const locationId = 1;

        for (const item of items) {
            
            await runQuery(
                `INSERT INTO StockMovement (product_id, location_id, type, quantity, reference_type, reference_id, note) VALUES (?, ?, 'PURCHASE_RECEIPT', ?, 'ORDER', ?, ?)`,
                [item.product_id, locationId, item.quantity, orderId, `Received from Supplier (Order #${orderId})`]
            );

            await runQuery(
                `UPDATE InventoryStock SET quantity_on_hand = quantity_on_hand + ? WHERE product_id = ? AND location_id = ?`,
                [item.quantity, item.product_id, locationId]
            );
        }

        await runQuery(`UPDATE OrderTable SET status = 'COMPLETED' WHERE id = ?`, [orderId]);
        await runQuery('COMMIT');
        res.json({ success: true, message: 'Order completed successfully' });
    } catch (err: any) {
        try { await runQuery('ROLLBACK'); } catch (e) {  }
        res.status(500).json({ error: 'Failed to complete order: ' + err.message });
    }
});





app.get('/api/cashflow/transactions', (req, res) => {
    const query = `
        SELECT t.*, p.name as product_name
        FROM TransactionLog t
        LEFT JOIN StockMovement sm ON sm.reference_type = 'TRANSACTION' AND sm.reference_id = t.id
        LEFT JOIN Product p ON sm.product_id = p.id
        ORDER BY t.created_at DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/cashflow/transaction', async (req, res) => {
    const { type, amount, note, created_by, product_id, quantity } = req.body;
    if (!['SALE', 'RETURN', 'EXPENSE'].includes(type) || !amount) {
        return res.status(400).json({ error: 'Invalid type or missing amount' });
    }

    try {
        await runQuery('BEGIN TRANSACTION');

        const txResult = await runQuery(
            `INSERT INTO TransactionLog (type, amount, note, created_by) VALUES (?, ?, ?, ?)`,
            [type, amount, note, created_by || 'System']
        );
        const transactionId = txResult.lastID;

        
        if (product_id && quantity) {
            const locationId = 1; 
            const qtyChange = type === 'SALE' ? -quantity : quantity;

            await runQuery(
                `INSERT INTO StockMovement (product_id, location_id, type, quantity, reference_type, reference_id, note) VALUES (?, ?, ?, ?, 'TRANSACTION', ?, ?)`,
                [product_id, locationId, type, qtyChange, transactionId, note || `Manual ${type}`]
            );

            await runQuery(
                `UPDATE InventoryStock SET quantity_on_hand = quantity_on_hand + ? WHERE product_id = ? AND location_id = ?`,
                [qtyChange, product_id, locationId]
            );
        }

        await runQuery('COMMIT');
        res.json({ success: true, transaction_id: transactionId });
    } catch (err: any) {
        try { await runQuery('ROLLBACK'); } catch (e) {  }
        res.status(500).json({ error: err.message });
    }
});





app.get('/api/dashboard/sales', (req, res) => {
    
    
    
    const query = `
        SELECT 
            date(created_at) as sale_date,
            SUM(CASE WHEN type = 'SALE' THEN amount ELSE 0 END) - 
            SUM(CASE WHEN type IN ('RETURN', 'EXPENSE') THEN amount ELSE 0 END) as net_sales
        FROM TransactionLog
        WHERE created_at >= date('now', '-7 days')
        GROUP BY sale_date
        ORDER BY sale_date ASC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        
        const formattedData = rows.map((row: any) => {
            const date = new Date(row.sale_date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            return {
                name: dayName,
                sales: Math.max(0, row.net_sales) 
            };
        });

        res.json(formattedData);
    });
});

app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const revenueResult = await getQuery(`
            SELECT SUM(CASE WHEN type = 'SALE' THEN amount 
                            WHEN type IN ('RETURN', 'EXPENSE') THEN -amount 
                            ELSE 0 END) as total_revenue
            FROM TransactionLog
        `);

        const productsResult = await getQuery(`SELECT COUNT(id) as total_products FROM Product`);

        const ordersResult = await getQuery(`SELECT COUNT(id) as total_orders FROM OrderTable`);

        res.json({
            total_revenue: revenueResult.total_revenue || 0,
            total_products: productsResult.total_products || 0,
            total_orders: ordersResult.total_orders || 0
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
