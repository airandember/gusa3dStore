import { supabase, type Product, type CartItem, type Order, type OrderItem, type StatusHistory } from './supabase';

// Re-export types for convenience
export type { Product, CartItem, Order, OrderItem, StatusHistory };

// Tracking response type
export interface TrackingResponse {
  order: Order;
  status_history: Array<{
    status: string;
    message: string;
    timestamp: string;
  }>;
}

// Session ID for cart (stored in localStorage)
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

// Generate tracking code
function generateTrackingCode(): string {
  const timestamp = Date.now() % 100000;
  const random = Math.floor(Math.random() * 1000);
  return `3DK-${timestamp}-${random}`;
}

// ==================== PRODUCTS ====================

export const productApi = {
  async getAll(category?: string): Promise<Product[]> {
    let query = supabase.from('products').select('*').order('id');
    
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getById(id: number): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(product: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: number, product: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ==================== CART ====================

export const cartApi = {
  async get(): Promise<CartItem[]> {
    const sessionId = getSessionId();
    
    const { data, error } = await supabase
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
    return (data || []).map(item => ({
      id: item.id,
      session_id: item.session_id,
      product_id: item.product_id,
      quantity: item.quantity,
      product: item.products as unknown as Product
    }));
  },

  async add(productId: number, quantity: number = 1): Promise<{ message: string }> {
    const sessionId = getSessionId();
    
    // Check if item already in cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId)
      .eq('product_id', productId)
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
        .insert([{ session_id: sessionId, product_id: productId, quantity }]);
    }
    
    return { message: 'Added to cart!' };
  },

  async update(itemId: number, quantity: number): Promise<{ message: string }> {
    const sessionId = getSessionId();
    
    if (quantity <= 0) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('session_id', sessionId);
    } else {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('session_id', sessionId);
    }
    
    return { message: 'Cart updated!' };
  },

  async remove(itemId: number): Promise<void> {
    const sessionId = getSessionId();
    
    await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('session_id', sessionId);
  },

  async clear(): Promise<void> {
    const sessionId = getSessionId();
    
    await supabase
      .from('cart_items')
      .delete()
      .eq('session_id', sessionId);
  }
};

// ==================== ORDERS ====================

export const orderApi = {
  async create(data: { customer_name: string; customer_email: string; address: string }): Promise<Order> {
    const sessionId = getSessionId();
    
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
      throw new Error('Cart is empty');
    }
    
    // Calculate total
    let total = 0;
    const orderItems: Partial<OrderItem>[] = cartItems.map(item => {
      const product = item.products as unknown as { id: number; name: string; price: number };
      const price = product?.price || 0;
      total += price * item.quantity;
      return {
        product_id: item.product_id,
        product_name: product?.name || 'Unknown',
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
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        address: data.address,
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
    
    return { ...order, items: orderItems as OrderItem[] };
  },

  async getById(id: number): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { ...data, items: data.order_items || [] };
  },

  async track(trackingCode: string): Promise<{ order: Order; status_history: Array<{ status: string; message: string; timestamp: string }> }> {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('tracking_code', trackingCode)
      .single();
    
    if (error) throw error;
    
    // Get status history
    const { data: statusHistory } = await supabase
      .from('status_history')
      .select('status, message, created_at')
      .eq('order_id', order.id)
      .order('created_at', { ascending: false });
    
    return {
      order: { ...order, items: order.order_items || [] },
      status_history: (statusHistory || []).map(s => ({
        status: s.status,
        message: s.message,
        timestamp: s.created_at
      }))
    };
  }
};

// ==================== ADMIN ====================

export const adminApi = {
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(order => ({
      ...order,
      items: order.order_items || []
    }));
  },

  async updateOrderStatus(id: number, status: string, message: string): Promise<{ message: string }> {
    // Update order
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    // Add to status history
    await supabase.from('status_history').insert([{
      order_id: id,
      status,
      message: message || `Status updated to ${status}`
    }]);
    
    return { message: 'Order updated!' };
  },

  async getStats(): Promise<{ total_products: number; total_orders: number; pending_orders: number; total_revenue: number }> {
    // Get product count
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    // Get orders for stats
    const { data: orders } = await supabase
      .from('orders')
      .select('status, total');
    
    const totalOrders = orders?.length || 0;
    const pendingStatuses = ['pending', 'confirmed', 'printing', 'quality_check', 'ready'];
    const pendingOrders = orders?.filter(o => pendingStatuses.includes(o.status)).length || 0;
    const totalRevenue = orders
      ?.filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + parseFloat(o.total || '0'), 0) || 0;
    
    return {
      total_products: productCount || 0,
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      total_revenue: totalRevenue
    };
  }
};
