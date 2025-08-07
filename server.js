const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
// Add these near the top of your server.js file
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Session configuration
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Update database connection
// Update the database connection configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'yashik@2006',
    database: 'izumi_inventory'  // Changed from 'izumi' to 'izumi_inventory'
});

// Add error handling for database connection
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
    
    // Create categories table immediately after successful connection
    db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating categories table:', err);
      } else {
        console.log('Categories table created or already exists');
      }
    });
});

// Make sure these middleware declarations are at the top of your server.js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add or update the POST endpoint for products
// Add this to create the products table if it doesn't exist
db.query(`
  CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(50) UNIQUE,
    category_id INT,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) console.error('Error creating products table:', err);
});

// Add this endpoint to handle saving new products and creating inventory entries
app.post('/api/products', (req, res) => {
    const { name, sku, category, price } = req.body;
    
    // First, insert the product
    const productQuery = 'INSERT INTO products (name, sku, category, price) VALUES (?, ?, ?, ?)';
    db.query(productQuery, [name, sku, category, price], (err, productResult) => {
        if (err) {
            console.error('Error adding product:', err);
            return res.status(500).json({ error: 'Failed to add product' });
        }
        
        // Then create inventory entry with initial quantity 0
        const inventoryQuery = 'INSERT INTO inventory (product_id, quantity) VALUES (?, 0)';
        db.query(inventoryQuery, [productResult.insertId], (err, inventoryResult) => {
            if (err) {
                console.error('Error creating inventory entry:', err);
                return res.status(500).json({ error: 'Failed to create inventory entry' });
            }
            
            res.status(201).json({ 
                message: 'Product and inventory entry created successfully',
                productId: productResult.insertId
            });
        });
    });
});

// Add GET endpoint logging
// Add these GET endpoints
// Update the GET products endpoint
// Add this endpoint to get all categories
app.get('/api/categories', (req, res) => {
    db.query('SELECT * FROM categories', (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
        }
        
        console.log('Categories fetched:', results);
        res.json(results);
    });
});
// Add these headers to allow CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

// Update the products endpoint
// Update the GET products endpoint
app.get('/api/products', (req, res) => {
    console.log('GET /api/products request received');
    
    const query = 'SELECT * FROM products';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        console.log(`Found ${results.length} products:`, results);
        res.json(results);
    });
});

// Add inventory endpoint
app.get('/api/inventory', (req, res) => {
    const query = `
        SELECT p.*, i.quantity 
        FROM products p 
        LEFT JOIN inventory i ON p.id = i.product_id
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching inventory:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('Inventory fetched:', results); // Debug log
        res.json(results);
    });
});
app.put('/api/products/:id', (req, res) => {
    const { name, sku, category, price } = req.body;
    const query = 'UPDATE products SET name=?, sku=?, category=?, price=? WHERE id=?';
    
    db.query(query, [name, sku, category, price, req.params.id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Product updated successfully' });
    });
});

app.delete('/api/products/:id', (req, res) => {
    const query = 'DELETE FROM products WHERE id=?';
    
    db.query(query, [req.params.id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Product deleted successfully' });
    });
});

// Add this test endpoint
app.get('/api/test', (req, res) => {
    db.query('SELECT 1 + 1 AS result', (err, results) => {
        if (err) {
            console.error('Database test failed:', err);
            res.status(500).json({ error: 'Database connection failed', details: err.message });
            return;
        }
        console.log('Database test successful:', results);
        res.json({ message: 'Database connection successful', results });
    });
});
// Add this debugging endpoint
app.get('/api/debug', (req, res) => {
    // Test database connection
    db.query('SELECT 1 + 1 AS solution', (err, results) => {
        if (err) {
            console.error('Database connection error:', err);
            return res.status(500).json({ error: 'Database connection error', details: err.message });
        }
        
        // If connection works, try to get products
        db.query('SELECT * FROM products', (err, products) => {
            if (err) {
                console.error('Error querying products:', err);
                return res.status(500).json({ error: 'Error querying products', details: err.message });
            }
            
            res.json({
                dbConnection: 'success',
                productsCount: products.length,
                products: products
            });
        });
    });
});
// Add this endpoint for updating inventory
// Update the inventory endpoint
app.post('/api/inventory/update', (req, res) => {
    const { sku, quantity } = req.body;
    
    // First get the product_id using SKU
    db.query('SELECT id FROM products WHERE sku = ?', [sku], (err, results) => {
        if (err) {
            console.error('Error finding product:', err);
            return res.status(500).json({ error: 'Failed to update inventory' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const productId = results[0].id;
        
        // Check if inventory record exists
        db.query('SELECT * FROM inventory WHERE product_id = ?', [productId], (err, results) => {
            if (err) {
                console.error('Error checking inventory:', err);
                return res.status(500).json({ error: 'Failed to update inventory' });
            }
            
            if (results.length === 0) {
                // Insert new inventory record
                db.query('INSERT INTO inventory (product_id, quantity) VALUES (?, ?)', 
                    [productId, quantity], (err) => {
                    if (err) {
                        console.error('Error creating inventory:', err);
                        return res.status(500).json({ error: 'Failed to update inventory' });
                    }
                    res.json({ message: 'Inventory updated successfully' });
                });
            } else {
                // Update existing inventory record
                db.query('UPDATE inventory SET quantity = quantity + ? WHERE product_id = ?', 
                    [quantity, productId], (err) => {
                    if (err) {
                        console.error('Error updating inventory:', err);
                        return res.status(500).json({ error: 'Failed to update inventory' });
                    }
                    res.json({ message: 'Inventory updated successfully' });
                });
            }
        });
    });
});
// Add this DELETE endpoint
// Add this endpoint for deleting inventory items
// Update the DELETE endpoint to use proper query
// Update the DELETE endpoint
app.delete('/api/products/:sku', (req, res) => {
    const sku = req.params.sku;
    console.log('Attempting to delete product with SKU:', sku);
    
    // Delete product directly by SKU
    db.query('DELETE FROM products WHERE sku = ?', [sku], (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).json({ error: 'Failed to delete product' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        console.log('Product deleted successfully');
        res.json({ message: 'Product deleted successfully' });
    });
});
// Add dashboard endpoints
app.get('/api/dashboard/stats', (req, res) => {
    const queries = {
        totalProducts: 'SELECT COUNT(*) as count FROM products',
        lowStockItems: 'SELECT COUNT(*) as count FROM inventory WHERE quantity < 5',
        totalValue: 'SELECT SUM(p.price * i.quantity) as total FROM products p JOIN inventory i ON p.id = i.product_id',
        categories: 'SELECT COUNT(DISTINCT category) as count FROM products'
    };

    Promise.all([
        new Promise((resolve, reject) => db.query(queries.totalProducts, (err, result) => err ? reject(err) : resolve(result[0]))),
        new Promise((resolve, reject) => db.query(queries.lowStockItems, (err, result) => err ? reject(err) : resolve(result[0]))),
        new Promise((resolve, reject) => db.query(queries.totalValue, (err, result) => err ? reject(err) : resolve(result[0]))),
        new Promise((resolve, reject) => db.query(queries.categories, (err, result) => err ? reject(err) : resolve(result[0])))
    ])
    .then(([products, lowStock, value, categories]) => {
        res.json({
            totalProducts: products.count,
            lowStockItems: lowStock.count,
            totalValue: value.total || 0,
            categories: categories.count
        });
    })
    .catch(err => {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    });
});

app.get('/api/dashboard/category-distribution', (req, res) => {
    const query = `
        SELECT 
            category,
            COUNT(*) as count
        FROM products
        GROUP BY category
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching category distribution:', err);
            return res.status(500).json({ error: 'Failed to fetch category distribution' });
        }
        res.json(results);
    });
});

app.get('/api/dashboard/inventory-overview', (req, res) => {
    const query = `
        SELECT 
            COALESCE(DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(NOW(), '%Y-%m')) as month,
            COUNT(p.id) as totalItems,
            COUNT(CASE WHEN COALESCE(i.quantity, 0) < 5 THEN 1 END) as lowStockItems
        FROM products p
        LEFT JOIN inventory i ON p.id = i.product_id
        WHERE created_at IS NOT NULL
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
        LIMIT 12
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching inventory overview:', err);
            return res.status(500).json({ error: 'Failed to fetch inventory overview' });
        }
        res.json(results);
    });
});

// Add this endpoint for deleting inventory items
// Update the DELETE endpoint to use proper query
// Update the DELETE endpoint
app.delete('/api/products/:sku', (req, res) => {
    const sku = req.params.sku;
    console.log('Attempting to delete product with SKU:', sku);
    
    // Delete product directly by SKU
    db.query('DELETE FROM products WHERE sku = ?', [sku], (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).json({ error: 'Failed to delete product' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        console.log('Product deleted successfully');
        res.json({ message: 'Product deleted successfully' });
    });
});
// Update the products PUT endpoint
app.put('/api/products/:sku', (req, res) => {
    const { sku } = req.params;
    const { name, category, price } = req.body;
    
    const query = `
        UPDATE products 
        SET name = ?, category = ?, price = ?
        WHERE sku = ?
    `;
    
    db.query(query, [name, category, price, sku], (err, result) => {
        if (err) {
            console.error('Error updating product:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ message: 'Product updated successfully' });
    });
});
// Add this endpoint to handle category creation
app.post('/api/categories', (req, res) => {
    const { name, description } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
    }
    
    const query = 'INSERT INTO categories (name, description) VALUES (?, ?)';
    
    db.query(query, [name, description], (err, result) => {
        if (err) {
            console.error('Error adding category:', err);
            return res.status(500).json({ error: 'Failed to add category' });
        }
        
        res.status(201).json({ 
            id: result.insertId,
            name,
            description,
            message: 'Category added successfully' 
        });
    });
});
// Change the port from 3002 to another port (e.g., 3003)
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); // Add closing brace and semicolon

// Add this endpoint to handle inventory updates
app.put('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    const query = 'UPDATE inventory SET quantity = ? WHERE id = ?';
    
    db.query(query, [quantity, id], (err, result) => {
        if (err) {
            console.error('Error updating inventory:', err);
            return res.status(500).json({ error: 'Failed to update inventory' });
        }
        
        res.json({ message: 'Inventory updated successfully' });
    });
});

// Add endpoint to create new product and inventory entry
app.post('/api/products', (req, res) => {
    const { name, sku, category_id, price } = req.body;
    
    const query = 'INSERT INTO products (name, sku, category_id, price) VALUES (?, ?, ?, ?)';
    
    db.query(query, [name, sku, category_id, price], (err, result) => {
        if (err) {
            console.error('Error adding product:', err);
            return res.status(500).json({ error: 'Failed to add product' });
        }
        
        res.status(201).json({ 
            id: result.insertId,
            name,
            sku,
            category_id,
            price
        });
    });
});

// Add endpoint to create inventory entry
app.post('/api/inventory', (req, res) => {
    const { product_id, quantity } = req.body;
    
    const query = 'INSERT INTO inventory (product_id, quantity) VALUES (?, ?)';
    
    db.query(query, [product_id, quantity], (err, result) => {
        if (err) {
            console.error('Error adding inventory:', err);
            return res.status(500).json({ error: 'Failed to add inventory entry' });
        }
        
        res.status(201).json({ 
            id: result.insertId,
            product_id,
            quantity
        });
    });
});