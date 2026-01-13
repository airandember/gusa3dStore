import { API_URL } from './config';

const API_BASE = `${API_URL}/api`;

// Generate or retrieve session ID
function getSessionId(): string {
	if (typeof window === 'undefined') return '';
	
	let sessionId = localStorage.getItem('session_id');
	if (!sessionId) {
		sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
		localStorage.setItem('session_id', sessionId);
	}
	return sessionId;
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		'X-Session-ID': getSessionId(),
		...(options.headers as Record<string, string>)
	};

	const response = await fetch(`${API_BASE}${endpoint}`, {
		...options,
		headers
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error || 'API request failed');
	}

	if (response.status === 204) {
		return {} as T;
	}

	return response.json();
}

// Types
export interface Product {
	id: number;
	name: string;
	description: string;
	price: number;
	image_url: string;
	category: string;
	in_stock: number;
	print_time: string;
	created_by: string;
	created_at: string;
}

export interface CartItem {
	id: number;
	product_id: number;
	product: Product;
	quantity: number;
	session_id: string;
}

export interface OrderItem {
	id: number;
	order_id: number;
	product_id: number;
	product_name: string;
	price: number;
	quantity: number;
}

export interface Order {
	id: number;
	session_id: string;
	customer_name: string;
	customer_email: string;
	address: string;
	total: number;
	status: string;
	tracking_code: string;
	items: OrderItem[];
	created_at: string;
	updated_at: string;
}

export interface OrderStatus {
	status: string;
	message: string;
	timestamp: string;
}

export interface TrackingResponse {
	order: Order;
	status_history: OrderStatus[];
}

export interface AdminStats {
	total_products: number;
	total_orders: number;
	pending_orders: number;
	total_revenue: number;
}

// Product API
export const productApi = {
	getAll: (category?: string) => 
		fetchApi<Product[]>(`/products${category ? `?category=${category}` : ''}`),
	
	getById: (id: number) => 
		fetchApi<Product>(`/products/${id}`),
	
	create: (product: Partial<Product>) => 
		fetchApi<Product>('/products', {
			method: 'POST',
			body: JSON.stringify(product)
		}),
	
	update: (id: number, product: Partial<Product>) => 
		fetchApi<Product>(`/products/${id}`, {
			method: 'PUT',
			body: JSON.stringify(product)
		}),
	
	delete: (id: number) => 
		fetchApi<void>(`/products/${id}`, { method: 'DELETE' })
};

// Cart API
export const cartApi = {
	get: () => fetchApi<CartItem[]>('/cart'),
	
	add: (productId: number, quantity: number = 1) => 
		fetchApi<{ message: string }>('/cart', {
			method: 'POST',
			body: JSON.stringify({ product_id: productId, quantity })
		}),
	
	update: (itemId: number, quantity: number) => 
		fetchApi<{ message: string }>(`/cart/${itemId}`, {
			method: 'PUT',
			body: JSON.stringify({ quantity })
		}),
	
	remove: (itemId: number) => 
		fetchApi<void>(`/cart/${itemId}`, { method: 'DELETE' }),
	
	clear: () => 
		fetchApi<void>('/cart', { method: 'DELETE' })
};

// Order API
export const orderApi = {
	create: (data: { customer_name: string; customer_email: string; address: string }) => 
		fetchApi<Order>('/orders', {
			method: 'POST',
			body: JSON.stringify(data)
		}),
	
	getById: (id: number) => 
		fetchApi<Order>(`/orders/${id}`),
	
	track: (trackingCode: string) => 
		fetchApi<TrackingResponse>(`/orders/track/${trackingCode}`)
};

// Admin API
export const adminApi = {
	getOrders: () => fetchApi<Order[]>('/admin/orders'),
	
	updateOrderStatus: (id: number, status: string, message: string) => 
		fetchApi<{ message: string }>(`/admin/orders/${id}`, {
			method: 'PUT',
			body: JSON.stringify({ status, message })
		}),
	
	getStats: () => fetchApi<AdminStats>('/admin/stats')
};
