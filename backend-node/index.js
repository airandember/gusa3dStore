require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  console.log('Please set these in your .env file or environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Generate tracking code
function generateTrackingCode() {
  const timestamp = Date.now() % 100000;
  const random = Math.floor(Math.random() * 1000);
  return `3DK-${timestamp}-${random}`;
}

// ==================== ROUTES ====================

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: '🖨️ Kids 3D Print Store API (Supabase Edition)' });
});

// ==================== PRODUCTS ====================

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = supabase.from('products').select('*');
    
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query.order('id');
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
app.post('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CART ====================

// Get cart
app.get('/api/cart', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }
    
    // Get cart items with product details
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        session_id,
        product_id,
        quantity,
        products (*)
      `)
      .eq('session_id', sessionId);
    
    if (error) throw error;
    
    // Transform to match expected format
    const items = (cartItems || []).map(item => ({
      id: item.id,
      session_id: item.session_id,
      product_id: item.product_id,
      quantity: item.quantity,
      product: item.products || {}
    }));
    
    res.json(items);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add to cart
app.post('/api/cart', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }
    
    const { product_id, quantity = 1 } = req.body;
    
    // Check if item already in cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId)
      .eq('product_id', product_id)
      .single();
    
    if (existing) {
      // Update quantity
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      // Insert new item
      await supabase
        .from('cart_items')
        .insert([{ session_id: sessionId, product_id, quantity }]);
    }
    
    res.status(201).json({ message: 'Added to cart!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update cart item
app.put('/api/cart/:id', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const { quantity } = req.body;
    
    if (quantity <= 0) {
      // Delete if quantity is 0 or less
      await supabase
        .from('cart_items')
        .delete()
        .eq('id', req.params.id)
        .eq('session_id', sessionId);
    } else {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', req.params.id)
        .eq('session_id', sessionId);
    }
    
    res.json({ message: 'Cart updated!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from cart
app.delete('/api/cart/:id', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    await supabase
      .from('cart_items')
      .delete()
      .eq('id', req.params.id)
      .eq('session_id', sessionId);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
app.delete('/api/cart', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    await supabase
      .from('cart_items')
      .delete()
      .eq('session_id', sessionId);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ORDERS ====================

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }
    
    const { customer_name, customer_email, address } = req.body;
    
    // Get cart items with product details
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        products (id, name, price)
      `)
      .eq('session_id', sessionId);
    
    if (cartError) throw cartError;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Calculate total
    let total = 0;
    const orderItems = cartItems.map(item => {
      const price = item.products?.price || 0;
      total += price * item.quantity;
      return {
        product_id: item.product_id,
        product_name: item.products?.name || 'Unknown',
        price: price,
        quantity: item.quantity
      };
    });
    
    // Create order
    const trackingCode = generateTrackingCode();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        session_id: sessionId,
        customer_name,
        customer_email,
        address,
        total,
        status: 'pending',
        tracking_code: trackingCode
      }])
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }));
    
    await supabase.from('order_items').insert(orderItemsWithOrderId);
    
    // Add initial status history
    await supabase.from('status_history').insert([{
      order_id: order.id,
      status: 'pending',
      message: "Order received! We're reviewing it. 🎉"
    }]);
    
    // Clear cart
    await supabase
      .from('cart_items')
      .delete()
      .eq('session_id', sessionId);
    
    // Return order with items
    res.status(201).json({
      ...order,
      items: orderItems
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    res.json({
      ...order,
      items: order.order_items || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track order by tracking code
app.get('/api/orders/track/:code', async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('tracking_code', req.params.code)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Get status history
    const { data: statusHistory } = await supabase
      .from('status_history')
      .select('status, message, created_at')
      .eq('order_id', order.id)
      .order('created_at', { ascending: false });
    
    res.json({
      order: {
        ...order,
        items: order.order_items || []
      },
      status_history: (statusHistory || []).map(s => ({
        status: s.status,
        message: s.message,
        timestamp: s.created_at
      }))
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN ====================

// Get all orders (admin)
app.get('/api/admin/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const orders = (data || []).map(order => ({
      ...order,
      items: order.order_items || []
    }));
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (admin)
app.put('/api/admin/orders/:id', async (req, res) => {
  try {
    const { status, message } = req.body;
    
    // Update order
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id);
    
    if (updateError) throw updateError;
    
    // Add to status history
    await supabase.from('status_history').insert([{
      order_id: parseInt(req.params.id),
      status,
      message: message || `Status updated to ${status}`
    }]);
    
    res.json({ message: 'Order updated!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get admin stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    // Get product count
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    // Get order counts
    const { data: orders } = await supabase
      .from('orders')
      .select('status, total');
    
    const totalOrders = orders?.length || 0;
    const pendingStatuses = ['pending', 'confirmed', 'printing', 'quality_check', 'ready'];
    const pendingOrders = orders?.filter(o => pendingStatuses.includes(o.status)).length || 0;
    const totalRevenue = orders
      ?.filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + parseFloat(o.total || 0), 0) || 0;
    
    res.json({
      total_products: productCount || 0,
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      total_revenue: totalRevenue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Kids 3D Print Store API running on http://localhost:${PORT}`);
  console.log(`📦 Connected to Supabase: ${supabaseUrl}`);
});
