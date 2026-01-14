import { writable, derived } from 'svelte/store';
import type { CartItem, Product } from './supabase';

// Cart store
function createCartStore() {
	const { subscribe, set, update } = writable<CartItem[]>([]);

	return {
		subscribe,
		set,
		update,
		addItem: (item: CartItem) => update(items => {
			const existing = items.find(i => i.product_id === item.product_id);
			if (existing) {
				return items.map(i => 
					i.product_id === item.product_id 
						? { ...i, quantity: i.quantity + item.quantity }
						: i
				);
			}
			return [...items, item];
		}),
		removeItem: (itemId: number) => update(items => items.filter(i => i.id !== itemId)),
		updateQuantity: (itemId: number, quantity: number) => update(items =>
			items.map(i => i.id === itemId ? { ...i, quantity } : i)
		),
		clear: () => set([])
	};
}

export const cart = createCartStore();

// Derived store for cart total
export const cartTotal = derived(cart, $cart => 
	$cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
);

// Derived store for cart count
export const cartCount = derived(cart, $cart => 
	$cart.reduce((sum, item) => sum + item.quantity, 0)
);

// Products store
export const products = writable<Product[]>([]);

// Categories store
export const categories = writable<string[]>([
	'All', 'Fantasy', 'Space', 'Useful', 'Dinosaurs', 'Gaming', 'Fidgets', 'Animals', 'Movies', 'Accessories'
]);

// Selected category
export const selectedCategory = writable<string>('All');

// Toast notifications
export interface Toast {
	id: number;
	message: string;
	type: 'success' | 'error' | 'info';
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);
	let nextId = 0;

	return {
		subscribe,
		show: (message: string, type: Toast['type'] = 'info') => {
			const id = nextId++;
			update(toasts => [...toasts, { id, message, type }]);
			
			// Auto dismiss after 3 seconds
			setTimeout(() => {
				update(toasts => toasts.filter(t => t.id !== id));
			}, 3000);
		},
		dismiss: (id: number) => update(toasts => toasts.filter(t => t.id !== id))
	};
}

export const toasts = createToastStore();
