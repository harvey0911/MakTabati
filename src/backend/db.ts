import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const isPackaged = process.env.NODE_ENV === 'production';
const userDataPath = process.env.USER_DATA_PATH;

let dbPath;
if (isPackaged && userDataPath) {
    dbPath = path.join(userDataPath, 'MakTabati.db');
} else {
    dbPath = path.resolve(__dirname, '..', '..', 'MakTabati.db');
}

console.log('Using database at:', dbPath);

export const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {

        db.run(`
            CREATE TABLE IF NOT EXISTS Product (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                sku TEXT UNIQUE,
                category_id INTEGER,
                unit TEXT,
                cost_price REAL DEFAULT 0,
                sell_price REAL DEFAULT 0,
                reorder_level INTEGER DEFAULT 0,
                active BOOLEAN DEFAULT 1
            )
        `);


        db.run(`
            CREATE TABLE IF NOT EXISTS StockLocation (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            )
        `);


        db.run(`
            CREATE TABLE IF NOT EXISTS InventoryStock (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                location_id INTEGER NOT NULL,
                quantity_on_hand INTEGER DEFAULT 0,
                FOREIGN KEY (product_id) REFERENCES Product(id),
                FOREIGN KEY (location_id) REFERENCES StockLocation(id),
                UNIQUE(product_id, location_id)
            )
        `);


        db.run(`
            CREATE TABLE IF NOT EXISTS StockMovement (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                location_id INTEGER NOT NULL,
                type TEXT NOT NULL, -- 'PURCHASE_RECEIPT', 'SALE', 'ADJUSTMENT', 'RETURN', 'TRANSFER_IN', 'TRANSFER_OUT'
                quantity INTEGER NOT NULL,
                unit_cost REAL,
                reference_type TEXT,
                reference_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_by TEXT,
                note TEXT,
                FOREIGN KEY (product_id) REFERENCES Product(id),
                FOREIGN KEY (location_id) REFERENCES StockLocation(id)
            )
        `);


        db.run(`
            CREATE TABLE IF NOT EXISTS OrderTable (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_name TEXT,
                total_amount REAL NOT NULL,
                status TEXT DEFAULT 'COMPLETED', -- 'PENDING', 'COMPLETED', 'CANCELLED'
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS OrderItem (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price REAL NOT NULL,
                FOREIGN KEY (order_id) REFERENCES OrderTable(id),
                FOREIGN KEY (product_id) REFERENCES Product(id)
            )
        `);


        db.run(`
            CREATE TABLE IF NOT EXISTS TransactionLog (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL, -- 'SALE', 'RETURN', 'EXPENSE'
                amount REAL NOT NULL,
                order_id INTEGER, -- Optional link to an order
                note TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_by TEXT,
                FOREIGN KEY (order_id) REFERENCES OrderTable(id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS SystemSettings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT NOT NULL
            )
        `);

        db.get("SELECT count(*) as count FROM StockLocation", (err, row: any) => {
            if (row && row.count === 0) {
                console.log("Seeding initial location...");
                db.run(`INSERT INTO StockLocation (name) VALUES ('Main Warehouse')`);
                db.run(`INSERT INTO StockLocation (name) VALUES ('Store Front')`);
            }
        });

        db.get("SELECT count(*) as count FROM SystemSettings WHERE key = 'admin_password'", (err, row: any) => {
            if (row && row.count === 0) {
                console.log("Seeding default admin password...");
                db.run(`INSERT INTO SystemSettings (key, value) VALUES ('admin_password', 'admin')`);
            }
        });
    });
}
