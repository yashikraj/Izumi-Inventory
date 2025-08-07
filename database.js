// Simple database implementation using localStorage
// This simulates a database but uses browser storage

const Database = {
    // Initialize the database with default tables if they don't exist
    init: function() {
        // Check if products table exists
        if (!localStorage.getItem('izumiProducts')) {
            localStorage.setItem('izumiProducts', JSON.stringify([]));
        }
        
        // Check if inventory table exists
        if (!localStorage.getItem('izumiInventory')) {
            localStorage.setItem('izumiInventory', JSON.stringify([]));
        }
        
        // Check if orders table exists
        if (!localStorage.getItem('izumiOrders')) {
            localStorage.setItem('izumiOrders', JSON.stringify([]));
        }
        
        // Check if users table exists
        if (!localStorage.getItem('izumiUsers')) {
            localStorage.setItem('izumiUsers', JSON.stringify([
                {
                    id: '1',
                    username: 'admin',
                    password: 'admin123', // In a real app, this would be hashed
                    role: 'admin'
                }
            ]));
        }
        
        console.log('Database initialized successfully');
    },
    
    // Products CRUD operations
    products: {
        getAll: function() {
            return JSON.parse(localStorage.getItem('izumiProducts') || '[]');
        },
        getById: function(id) {
            const products = this.getAll();
            return products.find(product => product.id === id);
        },
        add: function(product) {
            const products = this.getAll();
            // Generate ID if not provided
            if (!product.id) {
                product.id = Date.now().toString();
            }
            products.push(product);
            localStorage.setItem('izumiProducts', JSON.stringify(products));
            return product;
        },
        update: function(id, updatedProduct) {
            const products = this.getAll();
            const index = products.findIndex(product => product.id === id);
            if (index !== -1) {
                products[index] = { ...products[index], ...updatedProduct };
                localStorage.setItem('izumiProducts', JSON.stringify(products));
                return products[index];
            }
            return null;
        },
        delete: function(id) {
            const products = this.getAll();
            const filteredProducts = products.filter(product => product.id !== id);
            localStorage.setItem('izumiProducts', JSON.stringify(filteredProducts));
            return true;
        }
    },
    
    // Inventory CRUD operations
    inventory: {
        getAll: function() {
            return JSON.parse(localStorage.getItem('izumiInventory') || '[]');
        },
        getByProductId: function(productId) {
            const inventory = this.getAll();
            return inventory.find(item => item.productId === productId);
        },
        update: function(productId, quantity) {
            const inventory = this.getAll();
            const index = inventory.findIndex(item => item.productId === productId);
            
            if (index !== -1) {
                inventory[index].quantity = quantity;
                inventory[index].lastUpdated = new Date().toISOString();
                localStorage.setItem('izumiInventory', JSON.stringify(inventory));
                return inventory[index];
            }
            return null;
        },
        addProduct: function(productId, productName, sku, quantity = 0) {
            const inventory = this.getAll();
            const newItem = {
                productId,
                productName,
                sku,
                quantity,
                lastUpdated: new Date().toISOString()
            };
            inventory.push(newItem);
            localStorage.setItem('izumiInventory', JSON.stringify(inventory));
            return newItem;
        }
    },
    
    // Orders CRUD operations
    orders: {
        getAll: function() {
            return JSON.parse(localStorage.getItem('izumiOrders') || '[]');
        },
        getById: function(id) {
            const orders = this.getAll();
            return orders.find(order => order.id === id);
        },
        add: function(order) {
            const orders = this.getAll();
            // Generate ID if not provided
            if (!order.id) {
                order.id = Date.now().toString();
            }
            // Add timestamp if not provided
            if (!order.createdAt) {
                order.createdAt = new Date().toISOString();
            }
            orders.push(order);
            localStorage.setItem('izumiOrders', JSON.stringify(orders));
            return order;
        },
        update: function(id, updatedOrder) {
            const orders = this.getAll();
            const index = orders.findIndex(order => order.id === id);
            if (index !== -1) {
                orders[index] = { ...orders[index], ...updatedOrder };
                localStorage.setItem('izumiOrders', JSON.stringify(orders));
                return orders[index];
            }
            return null;
        },
        delete: function(id) {
            const orders = this.getAll();
            const filteredOrders = orders.filter(order => order.id !== id);
            localStorage.setItem('izumiOrders', JSON.stringify(filteredOrders));
            return true;
        }
    },
    
    // Users CRUD operations
    users: {
        getAll: function() {
            return JSON.parse(localStorage.getItem('izumiUsers') || '[]');
        },
        getByUsername: function(username) {
            const users = this.getAll();
            return users.find(user => user.username === username);
        },
        add: function(user) {
            const users = this.getAll();
            // Generate ID if not provided
            if (!user.id) {
                user.id = Date.now().toString();
            }
            users.push(user);
            localStorage.setItem('izumiUsers', JSON.stringify(users));
            return user;
        },
        update: function(id, updatedUser) {
            const users = this.getAll();
            const index = users.findIndex(user => user.id === id);
            if (index !== -1) {
                users[index] = { ...users[index], ...updatedUser };
                localStorage.setItem('izumiUsers', JSON.stringify(users));
                return users[index];
            }
            return null;
        },
        delete: function(id) {
            const users = this.getAll();
            const filteredUsers = users.filter(user => user.id !== id);
            localStorage.setItem('izumiUsers', JSON.stringify(filteredUsers));
            return true;
        }
    }
};

// Initialize the database when this script loads
Database.init();

// Export the Database object for use in other scripts
window.Database = Database;