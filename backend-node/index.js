const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const DATA_FILE = path.join(__dirname, 'store.json');

// Middleware
app.use(cors());
app.use(express.json());

// In-memory store
let store = {
  products: [],
  cartItems: [],
  orders: [],
  statusHistory: [],
  nextProductId: 1,
  nextCartId: 1,
  nextOrderId: 1,
  nextStatusId: 1
};

// Load data from file
function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      store = JSON.parse(data);
      console.log(`✅ Loaded ${store.products.length} products, ${store.orders.length} orders`);
    } else {
      console.log('No existing data file, seeding sample products...');
      seedProducts();
      saveStore();
    }
  } catch (err) {
    console.error('Error loading store:', err);
    seedProducts();
    saveStore();
  }
}

// Save data to file
function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error('Error saving store:', err);
  }
}

// Seed sample products
function seedProducts() {
  const sampleProducts = [
    { name: "Cute Dragon", description: "A friendly little dragon that glows in the dark! Perfect desk buddy.", price: 8.50, image_url: "/images/dragon.png", category: "Fantasy", in_stock: 15, print_time: "3 hours", created_by: "Emma (12)" },
    { name: "Rocket Ship", description: "Blast off with this awesome rocket! Has movable fins.", price: 12.00, image_url: "/images/rocket.png", category: "Space", in_stock: 10, print_time: "4 hours", created_by: "Jake (11)" },
    { name: "Phone Stand", description: "Cool geometric phone stand. Holds any phone!", price: 5.00, image_url: "/images/phonestand.png", category: "Useful", in_stock: 25, print_time: "2 hours", created_by: "Mia (13)" },
    { name: "Dino T-Rex", description: "Roar! This T-Rex has articulated joints and can pose.", price: 15.00, image_url: "/images/trex.png", category: "Dinosaurs", in_stock: 8, print_time: "5 hours", created_by: "Lucas (12)" },
    { name: "Minecraft Creeper", description: "Ssssss... Don't worry, this one won't explode!", price: 7.00, image_url: "/images/creeper.png", category: "Gaming", in_stock: 20, print_time: "2.5 hours", created_by: "Sophie (11)" },
    { name: "Fidget Spinner", description: "Super smooth spinning action. Satisfying clicks!", price: 4.50, image_url: "/images/spinner.png", category: "Fidgets", in_stock: 30, print_time: "1.5 hours", created_by: "Noah (13)" },
    { name: "Unicorn", description: "Magical rainbow unicorn with sparkly finish.", price: 10.00, image_url: "/images/unicorn.png", category: "Fantasy", in_stock: 12, print_time: "3.5 hours", created_by: "Emma (12)" },
    { name: "Articulated Snake", description: "Wiggly snake that actually moves! So satisfying.", price: 6.00, image_url: "/images/snake.png", category: "Animals", in_stock: 18, print_time: "2 hours", created_by: "Jake (11)" },
    { name: "Pencil Holder", description: "Keep your desk organized with this cool holder!", price: 5.50, image_url: "/images/pencilholder.png", category: "Useful", in_stock: 22, print_time: "2.5 hours", created_by: "Mia (13)" },
    { name: "Baby Yoda", description: "The cutest little guy from the galaxy far far away.", price: 11.00, image_url: "/images/babyyoda.png", category: "Movies", in_stock: 14, print_time: "3 hours", created_by: "Lucas (12)" },
    { name: "Flexi Octopus", description: "Eight wiggly tentacles! Stress relief champion.", price: 8.00, image_url: "/images/octopus.png", category: "Animals", in_stock: 16, print_time: "3 hours", created_by: "Sophie (11)" },
    { name: "Keychain Set", description: "Pack of 3 custom keychains - heart, star, and moon!", price: 6.50, image_url: "/images/keychains.png", category: "Accessories", in_stock: 35, print_time: "1 hour", created_by: "Noah (13)" }
  ];

  sampleProducts.forEach(p => {
    store.products.push({
      id: store.nextProductId++,
      ...p,
      created_at: new Date().toISOString()
    });
  });
  console.log('✅ Seeded sample products!');
}

// Generate tracking code
function generateTrackingCode() {
  const timestamp = Date.now() % 100000;
  const random = Math.floor(Math.random() * 1000);
  return `3DK-${timestamp}-${random}`;
}

// ==================== ROUTES ====================

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: '🖨️ Kids 3D Print Store API' });
});

// ==================== PRODUCTS ====================

// Get all products
app.get('/api/products', (req, res) => {
  const { category } = req.query;
  let products = store.products;
  
  if (category && category !== 'All') {
    products = products.filter(p => p.category === category);
  }
  
  res.json(products);
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = store.products.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
});

// Create product
app.post('/api/products', (req, res) => {
  const product = {
    id: store.nextProductId++,
    ...req.body,
    created_at: new Date().toISOString()
  };
  
  store.products.push(product);
  saveStore();
  
  res.status(201).json(product);
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = store.products.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  store.products[index] = {
    ...store.products[index],
    ...req.body,
    id // Keep original ID
  };
  saveStore();
  
  res.json(store.products[index]);
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = store.products.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  store.products.splice(index, 1);
  saveStore();
  
  res.status(204).send();
});

// ==================== CART ====================

// Get cart
app.get('/api/cart', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }
  
  const items = store.cartItems
    .filter(ci => ci.session_id === sessionId)
    .map(ci => {
      const product = store.products.find(p => p.id === ci.product_id);
      return { ...ci, product: product || {} };
    });
  
  res.json(items);
});

// Add to cart
app.post('/api/cart', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }
  
  const { product_id, quantity = 1 } = req.body;
  
  // Check if item already in cart
  const existing = store.cartItems.find(
    ci => ci.session_id === sessionId && ci.product_id === product_id
  );
  
  if (existing) {
    existing.quantity += quantity;
  } else {
    store.cartItems.push({
      id: store.nextCartId++,
      session_id: sessionId,
      product_id,
      quantity
    });
  }
  
  saveStore();
  res.status(201).json({ message: 'Added to cart!' });
});

// Update cart item
app.put('/api/cart/:id', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const id = parseInt(req.params.id);
  const { quantity } = req.body;
  
  const index = store.cartItems.findIndex(
    ci => ci.id === id && ci.session_id === sessionId
  );
  
  if (index === -1) {
    return res.status(404).json({ error: 'Cart item not found' });
  }
  
  if (quantity <= 0) {
    store.cartItems.splice(index, 1);
  } else {
    store.cartItems[index].quantity = quantity;
  }
  
  saveStore();
  res.json({ message: 'Cart updated!' });
});

// Remove from cart
app.delete('/api/cart/:id', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const id = parseInt(req.params.id);
  
  const index = store.cartItems.findIndex(
    ci => ci.id === id && ci.session_id === sessionId
  );
  
  if (index === -1) {
    return res.status(404).json({ error: 'Cart item not found' });
  }
  
  store.cartItems.splice(index, 1);
  saveStore();
  
  res.status(204).send();
});

// Clear cart
app.delete('/api/cart', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  store.cartItems = store.cartItems.filter(ci => ci.session_id !== sessionId);
  saveStore();
  res.status(204).send();
});

// ==================== ORDERS ====================

// Create order
app.post('/api/orders', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }
  
  const { customer_name, customer_email, address } = req.body;
  
  // Get cart items
  const cartItems = store.cartItems.filter(ci => ci.session_id === sessionId);
  
  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  
  // Calculate total and create order items
  let total = 0;
  const orderItems = cartItems.map(ci => {
    const product = store.products.find(p => p.id === ci.product_id);
    if (product) {
      total += product.price * ci.quantity;
      return {
        product_id: ci.product_id,
        product_name: product.name,
        price: product.price,
        quantity: ci.quantity
      };
    }
    return null;
  }).filter(Boolean);
  
  const now = new Date().toISOString();
  const order = {
    id: store.nextOrderId++,
    session_id: sessionId,
    customer_name,
    customer_email,
    address,
    total,
    status: 'pending',
    tracking_code: generateTrackingCode(),
    items: orderItems,
    created_at: now,
    updated_at: now
  };
  
  store.orders.push(order);
  
  // Add initial status history
  store.statusHistory.push({
    id: store.nextStatusId++,
    order_id: order.id,
    status: 'pending',
    message: "Order received! We're reviewing it. 🎉",
    timestamp: now
  });
  
  // Clear cart
  store.cartItems = store.cartItems.filter(ci => ci.session_id !== sessionId);
  
  saveStore();
  res.status(201).json(order);
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const order = store.orders.find(o => o.id === id);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  res.json(order);
});

// Track order by tracking code
app.get('/api/orders/track/:code', (req, res) => {
  const code = req.params.code;
  const order = store.orders.find(o => o.tracking_code === code);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  // Get status history (newest first)
  const statusHistory = store.statusHistory
    .filter(sh => sh.order_id === order.id)
    .map(sh => ({
      status: sh.status,
      message: sh.message,
      timestamp: sh.timestamp
    }))
    .reverse();
  
  res.json({ order, status_history: statusHistory });
});

// ==================== ADMIN ====================

// Get all orders (admin)
app.get('/api/admin/orders', (req, res) => {
  // Return orders newest first
  const orders = [...store.orders].reverse();
  res.json(orders);
});

// Update order status (admin)
app.put('/api/admin/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { status, message } = req.body;
  
  const order = store.orders.find(o => o.id === id);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  order.status = status;
  order.updated_at = new Date().toISOString();
  
  // Add to status history
  store.statusHistory.push({
    id: store.nextStatusId++,
    order_id: id,
    status,
    message: message || `Status updated to ${status}`,
    timestamp: new Date().toISOString()
  });
  
  saveStore();
  res.json({ message: 'Order updated!' });
});

// Get admin stats
app.get('/api/admin/stats', (req, res) => {
  const totalRevenue = store.orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);
  
  const pendingStatuses = ['pending', 'confirmed', 'printing', 'quality_check', 'ready'];
  const pendingOrders = store.orders.filter(o => pendingStatuses.includes(o.status)).length;
  
  res.json({
    total_products: store.products.length,
    total_orders: store.orders.length,
    pending_orders: pendingOrders,
    total_revenue: totalRevenue
  });
});

// ==================== START SERVER ====================

loadStore();

app.listen(PORT, () => {
  console.log(`🚀 Kids 3D Print Store API running on http://localhost:${PORT}`);
});
