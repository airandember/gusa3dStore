<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { productApi, adminApi } from '$lib/api';
	import type { Product, Order } from '$lib/supabase';
	import { toasts, categories } from '$lib/stores';
	import { auth, isLoggedIn, isAuthLoading } from '$lib/auth';

	let activeTab = 'dashboard';
	let products: Product[] = [];
	let orders: Order[] = [];
	let stats: { total_products: number; total_orders: number; pending_orders: number; total_revenue: number } | null = null;
	let loading = true;

	// Product form
	let showProductForm = false;
	let editingProduct: Product | null = null;
	let productForm = {
		name: '',
		description: '',
		price: 0,
		image_url: '',
		category: 'Fantasy',
		in_stock: 10,
		print_time: '2 hours',
		created_by: ''
	};

	// Order status update
	let selectedOrder: Order | null = null;
	let statusMessage = '';

	const statusOptions = [
		{ value: 'pending', label: '📋 Pending' },
		{ value: 'confirmed', label: '✅ Confirmed' },
		{ value: 'printing', label: '🖨️ Printing' },
		{ value: 'quality_check', label: '🔍 Quality Check' },
		{ value: 'ready', label: '📦 Ready to Ship' },
		{ value: 'shipped', label: '🚚 Shipped' },
		{ value: 'delivered', label: '🎉 Delivered' }
	];

	// Redirect if not logged in
	$: if (!$isAuthLoading && !$isLoggedIn) {
		goto('/admin/login');
	}

	onMount(async () => {
		// Wait for auth to initialize
		if (!$isAuthLoading && $isLoggedIn) {
			await loadData();
		}
	});

	// Load data when auth state changes
	$: if (!$isAuthLoading && $isLoggedIn && loading) {
		loadData();
	}

	async function loadData() {
		loading = true;
		try {
			const [productsData, ordersData, statsData] = await Promise.all([
				productApi.getAll(),
				adminApi.getOrders(),
				adminApi.getStats()
			]);
			products = productsData;
			orders = ordersData;
			stats = statsData;
		} catch (e) {
			console.error('Failed to load data:', e);
			toasts.show('Failed to load data', 'error');
		} finally {
			loading = false;
		}
	}

	function openProductForm(product?: Product) {
		if (product) {
			editingProduct = product;
			productForm = {
				name: product.name,
				description: product.description,
				price: product.price,
				image_url: product.image_url,
				category: product.category,
				in_stock: product.in_stock,
				print_time: product.print_time,
				created_by: product.created_by
			};
		} else {
			editingProduct = null;
			productForm = {
				name: '',
				description: '',
				price: 0,
				image_url: '',
				category: 'Fantasy',
				in_stock: 10,
				print_time: '2 hours',
				created_by: ''
			};
		}
		showProductForm = true;
	}

	async function saveProduct() {
		try {
			if (editingProduct) {
				await productApi.update(editingProduct.id, productForm);
				toasts.show('Product updated! 🎉', 'success');
			} else {
				await productApi.create(productForm);
				toasts.show('Product added! 🎉', 'success');
			}
			showProductForm = false;
			await loadData();
		} catch (e) {
			toasts.show('Failed to save product', 'error');
		}
	}

	async function deleteProduct(id: number) {
		if (!confirm('Are you sure you want to delete this product?')) return;
		try {
			await productApi.delete(id);
			toasts.show('Product deleted', 'info');
			await loadData();
		} catch (e) {
			toasts.show('Failed to delete product', 'error');
		}
	}

	async function updateOrderStatus(order: Order, newStatus: string) {
		try {
			await adminApi.updateOrderStatus(order.id, newStatus, statusMessage || `Status updated to ${newStatus}`);
			toasts.show('Order status updated! 🎉', 'success');
			selectedOrder = null;
			statusMessage = '';
			await loadData();
		} catch (e) {
			toasts.show('Failed to update order', 'error');
		}
	}

	function getStatusEmoji(status: string): string {
		const emojis: Record<string, string> = {
			'pending': '📋',
			'confirmed': '✅',
			'printing': '🖨️',
			'quality_check': '🔍',
			'ready': '📦',
			'shipped': '🚚',
			'delivered': '🎉'
		};
		return emojis[status] || '📋';
	}

	function getCategoryEmoji(category: string): string {
		const emojis: Record<string, string> = {
			'Fantasy': '🐉',
			'Space': '🚀',
			'Useful': '📦',
			'Dinosaurs': '🦖',
			'Gaming': '🎮',
			'Fidgets': '🌀',
			'Animals': '🐙',
			'Movies': '🎬',
			'Accessories': '🔑'
		};
		return emojis[category] || '📦';
	}
</script>

<svelte:head>
	<title>Admin Dashboard - GUSA3D ⚙️</title>
</svelte:head>

<div class="admin-page">
	<div class="container">
		<!-- Header -->
		<div class="admin-header">
			<h1>⚙️ Admin Dashboard</h1>
			<p>Manage your awesome 3D print shop!</p>
		</div>

		<!-- Tabs -->
		<div class="tabs">
			<button 
				class="tab" 
				class:active={activeTab === 'dashboard'}
				on:click={() => activeTab = 'dashboard'}
			>
				📊 Dashboard
			</button>
			<button 
				class="tab" 
				class:active={activeTab === 'products'}
				on:click={() => activeTab = 'products'}
			>
				🎨 Products
			</button>
			<button 
				class="tab" 
				class:active={activeTab === 'orders'}
				on:click={() => activeTab = 'orders'}
			>
				📦 Orders
			</button>
		</div>

		{#if loading}
			<div class="loading">
				<span class="loading-spinner">⚙️</span>
				<p>Loading...</p>
			</div>
		{:else}
			<!-- Dashboard Tab -->
			{#if activeTab === 'dashboard'}
				<div class="dashboard-tab">
					<div class="stats-grid">
						<div class="stat-card">
							<span class="stat-icon">🎨</span>
							<div class="stat-content">
								<span class="stat-value">{stats?.total_products || 0}</span>
								<span class="stat-label">Total Products</span>
							</div>
						</div>
						<div class="stat-card">
							<span class="stat-icon">📦</span>
							<div class="stat-content">
								<span class="stat-value">{stats?.total_orders || 0}</span>
								<span class="stat-label">Total Orders</span>
							</div>
						</div>
						<div class="stat-card">
							<span class="stat-icon">⏳</span>
							<div class="stat-content">
								<span class="stat-value">{stats?.pending_orders || 0}</span>
								<span class="stat-label">Pending Orders</span>
							</div>
						</div>
						<div class="stat-card">
							<span class="stat-icon">💰</span>
							<div class="stat-content">
								<span class="stat-value">${(stats?.total_revenue || 0).toFixed(2)}</span>
								<span class="stat-label">Total Revenue</span>
							</div>
						</div>
					</div>

					<div class="quick-actions">
						<h3>Quick Actions</h3>
						<div class="actions-grid">
							<button class="action-btn" on:click={() => { activeTab = 'products'; openProductForm(); }}>
								<span class="action-icon">➕</span>
								<span>Add New Product</span>
							</button>
							<button class="action-btn" on:click={() => activeTab = 'orders'}>
								<span class="action-icon">📋</span>
								<span>View Orders</span>
							</button>
							<button class="action-btn" on:click={loadData}>
								<span class="action-icon">🔄</span>
								<span>Refresh Data</span>
							</button>
						</div>
					</div>

					{#if orders.filter(o => o.status !== 'delivered').length > 0}
						<div class="recent-orders">
							<h3>🔔 Orders Needing Attention</h3>
							<div class="orders-preview">
								{#each orders.filter(o => o.status !== 'delivered').slice(0, 5) as order}
									<div class="order-preview-card">
										<div class="order-preview-header">
											<span>Order #{order.id}</span>
											<span class="order-status">{getStatusEmoji(order.status)} {order.status}</span>
										</div>
										<div class="order-preview-details">
											<span>{order.customer_name}</span>
											<span class="price">{order.total.toFixed(2)}</span>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Products Tab -->
			{#if activeTab === 'products'}
				<div class="products-tab">
					<div class="tab-header">
						<h3>🎨 Manage Products ({products.length})</h3>
						<button class="btn btn-primary" on:click={() => openProductForm()}>
							➕ Add Product
						</button>
					</div>

					<div class="products-table">
						<table>
							<thead>
								<tr>
									<th>Product</th>
									<th>Category</th>
									<th>Price</th>
									<th>Stock</th>
									<th>Creator</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each products as product}
									<tr>
										<td>
											<div class="product-cell">
												<span class="product-emoji">{getCategoryEmoji(product.category)}</span>
												<span class="product-name">{product.name}</span>
											</div>
										</td>
										<td>
											<span class="badge badge-secondary">{product.category}</span>
										</td>
										<td>
											<span class="price">{product.price.toFixed(2)}</span>
										</td>
										<td>
											<span class:low-stock={product.in_stock < 5}>{product.in_stock}</span>
										</td>
										<td>{product.created_by}</td>
										<td>
											<div class="actions">
												<button class="action-btn-sm edit" on:click={() => openProductForm(product)}>
													✏️
												</button>
												<button class="action-btn-sm delete" on:click={() => deleteProduct(product.id)}>
													🗑️
												</button>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			<!-- Orders Tab -->
			{#if activeTab === 'orders'}
				<div class="orders-tab">
					<div class="tab-header">
						<h3>📦 Manage Orders ({orders.length})</h3>
						<button class="btn btn-secondary" on:click={loadData}>
							🔄 Refresh
						</button>
					</div>

					{#if orders.length === 0}
						<div class="no-orders">
							<span class="no-orders-emoji">📭</span>
							<h4>No orders yet!</h4>
							<p>When customers place orders, they'll show up here.</p>
						</div>
					{:else}
						<div class="orders-list">
							{#each orders as order}
								<div class="order-card">
									<div class="order-card-header">
										<div class="order-info">
											<h4>Order #{order.id}</h4>
											<span class="tracking-code">{order.tracking_code}</span>
										</div>
										<div class="order-status-badge" class:delivered={order.status === 'delivered'}>
											{getStatusEmoji(order.status)} {order.status}
										</div>
									</div>

									<div class="order-card-body">
										<div class="order-customer">
											<p><strong>Customer:</strong> {order.customer_name}</p>
											<p><strong>Email:</strong> {order.customer_email}</p>
											<p><strong>Address:</strong> {order.address}</p>
										</div>

										<div class="order-items">
											<p><strong>Items:</strong></p>
											{#each order.items || [] as item}
												<span class="order-item-badge">{item.quantity}x {item.product_name}</span>
											{/each}
										</div>

										<div class="order-total">
											<span>Total:</span>
											<span class="price">{order.total.toFixed(2)}</span>
										</div>
									</div>

									<div class="order-card-actions">
										{#if selectedOrder?.id === order.id}
											<div class="status-update-form">
												<select bind:value={order.status} class="status-select">
													{#each statusOptions as opt}
														<option value={opt.value}>{opt.label}</option>
													{/each}
												</select>
												<input 
													type="text" 
													bind:value={statusMessage}
													placeholder="Status message (optional)"
													class="status-message"
												/>
												<div class="status-buttons">
													<button 
														class="btn btn-primary btn-sm"
														on:click={() => updateOrderStatus(order, order.status)}
													>
														Save
													</button>
													<button 
														class="btn btn-outline btn-sm"
														on:click={() => selectedOrder = null}
													>
														Cancel
													</button>
												</div>
											</div>
										{:else}
											<button 
												class="btn btn-secondary btn-sm"
												on:click={() => selectedOrder = order}
											>
												📝 Update Status
											</button>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		{/if}

		<!-- Product Form Modal -->
		{#if showProductForm}
			<div class="modal-overlay" on:click={() => showProductForm = false}>
				<div class="modal" on:click|stopPropagation>
					<div class="modal-header">
						<h3>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
						<button class="modal-close" on:click={() => showProductForm = false}>✕</button>
					</div>
					<form on:submit|preventDefault={saveProduct} class="product-form">
						<div class="form-row">
							<div class="form-group">
								<label for="name">Product Name</label>
								<input type="text" id="name" bind:value={productForm.name} required />
							</div>
							<div class="form-group">
								<label for="category">Category</label>
								<select id="category" bind:value={productForm.category}>
									{#each $categories.filter(c => c !== 'All') as cat}
										<option value={cat}>{getCategoryEmoji(cat)} {cat}</option>
									{/each}
								</select>
							</div>
						</div>

						<div class="form-group">
							<label for="description">Description</label>
							<textarea id="description" bind:value={productForm.description} rows="3" required></textarea>
						</div>

						<div class="form-row">
							<div class="form-group">
								<label for="price">Price ($)</label>
								<input type="number" id="price" bind:value={productForm.price} step="0.01" min="0" required />
							</div>
							<div class="form-group">
								<label for="stock">In Stock</label>
								<input type="number" id="stock" bind:value={productForm.in_stock} min="0" required />
							</div>
						</div>

						<div class="form-row">
							<div class="form-group">
								<label for="print_time">Print Time</label>
								<input type="text" id="print_time" bind:value={productForm.print_time} placeholder="e.g., 2 hours" required />
							</div>
							<div class="form-group">
								<label for="created_by">Created By</label>
								<input type="text" id="created_by" bind:value={productForm.created_by} placeholder="e.g., Emma (12)" required />
							</div>
						</div>

						<div class="form-actions">
							<button type="button" class="btn btn-outline" on:click={() => showProductForm = false}>
								Cancel
							</button>
							<button type="submit" class="btn btn-primary">
								{editingProduct ? 'Save Changes' : 'Add Product'}
							</button>
						</div>
					</form>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.admin-page {
		min-height: 60vh;
	}

	.admin-header {
		text-align: center;
		margin-bottom: var(--space-xl);
	}

	.admin-header h1 {
		margin-bottom: var(--space-sm);
	}

	/* Tabs */
	.tabs {
		display: flex;
		gap: var(--space-sm);
		margin-bottom: var(--space-xl);
		background: var(--color-white);
		padding: var(--space-sm);
		border-radius: var(--radius-full);
		box-shadow: var(--shadow-sm);
	}

	.tab {
		flex: 1;
		padding: var(--space-md);
		background: transparent;
		border: none;
		border-radius: var(--radius-full);
		font-family: var(--font-body);
		font-weight: 600;
		cursor: pointer;
		transition: var(--transition-bounce);
	}

	.tab:hover {
		background: var(--color-light);
	}

	.tab.active {
		background: var(--color-primary);
		color: var(--color-white);
	}

	/* Loading */
	.loading {
		text-align: center;
		padding: var(--space-2xl);
	}

	.loading-spinner {
		display: block;
		font-size: 3rem;
		animation: spin 2s linear infinite;
		margin-bottom: var(--space-md);
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* Dashboard Tab */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-lg);
		margin-bottom: var(--space-xl);
	}

	.stat-card {
		background: var(--color-white);
		padding: var(--space-lg);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		display: flex;
		align-items: center;
		gap: var(--space-md);
		transition: var(--transition-bounce);
	}

	.stat-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-md);
	}

	.stat-icon {
		font-size: 2.5rem;
	}

	.stat-content {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-family: var(--font-display);
		font-size: 1.75rem;
		color: var(--color-primary);
	}

	.stat-label {
		font-size: 0.875rem;
		color: var(--color-gray-500);
	}

	.quick-actions {
		background: var(--color-white);
		padding: var(--space-lg);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		margin-bottom: var(--space-xl);
	}

	.quick-actions h3 {
		font-family: var(--font-body);
		font-weight: 600;
		margin-bottom: var(--space-md);
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-md);
	}

	.action-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-lg);
		background: var(--color-light);
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: var(--transition-bounce);
		font-family: var(--font-body);
	}

	.action-btn:hover {
		background: var(--color-secondary);
		color: var(--color-white);
		transform: translateY(-2px);
	}

	.action-icon {
		font-size: 2rem;
	}

	.recent-orders {
		background: var(--color-white);
		padding: var(--space-lg);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
	}

	.recent-orders h3 {
		font-family: var(--font-body);
		font-weight: 600;
		margin-bottom: var(--space-md);
	}

	.orders-preview {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.order-preview-card {
		padding: var(--space-md);
		background: var(--color-light);
		border-radius: var(--radius-md);
	}

	.order-preview-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: var(--space-xs);
		font-weight: 600;
	}

	.order-preview-details {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
		color: var(--color-gray-500);
	}

	/* Products Tab */
	.tab-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-lg);
	}

	.tab-header h3 {
		font-family: var(--font-body);
		font-weight: 600;
	}

	.products-table {
		background: var(--color-white);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th, td {
		padding: var(--space-md);
		text-align: left;
		border-bottom: 1px solid var(--color-gray-100);
	}

	th {
		background: var(--color-light);
		font-weight: 600;
		font-size: 0.875rem;
		text-transform: uppercase;
		color: var(--color-gray-500);
	}

	.product-cell {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.product-emoji {
		font-size: 1.5rem;
	}

	.product-name {
		font-weight: 600;
	}

	.low-stock {
		color: var(--color-primary);
		font-weight: 600;
	}

	.actions {
		display: flex;
		gap: var(--space-xs);
	}

	.action-btn-sm {
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-light);
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: var(--transition-fast);
	}

	.action-btn-sm.edit:hover {
		background: var(--color-secondary);
	}

	.action-btn-sm.delete:hover {
		background: var(--color-primary);
	}

	/* Orders Tab */
	.no-orders {
		text-align: center;
		padding: var(--space-2xl);
		background: var(--color-white);
		border-radius: var(--radius-lg);
	}

	.no-orders-emoji {
		display: block;
		font-size: 4rem;
		margin-bottom: var(--space-md);
	}

	.orders-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.order-card {
		background: var(--color-white);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
	}

	.order-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-md);
		background: var(--color-light);
	}

	.order-info h4 {
		font-family: var(--font-body);
		font-weight: 600;
		margin-bottom: var(--space-xs);
	}

	.tracking-code {
		font-family: monospace;
		font-size: 0.75rem;
		color: var(--color-gray-500);
	}

	.order-status-badge {
		padding: var(--space-xs) var(--space-md);
		background: var(--color-orange);
		color: var(--color-white);
		border-radius: var(--radius-full);
		font-weight: 600;
		font-size: 0.875rem;
	}

	.order-status-badge.delivered {
		background: var(--color-green);
	}

	.order-card-body {
		padding: var(--space-md);
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		gap: var(--space-md);
	}

	.order-customer p, .order-items p {
		font-size: 0.875rem;
		margin-bottom: var(--space-xs);
	}

	.order-item-badge {
		display: inline-block;
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-light);
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		margin-right: var(--space-xs);
		margin-bottom: var(--space-xs);
	}

	.order-total {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
	}

	.order-total .price {
		font-size: 1.5rem;
	}

	.order-card-actions {
		padding: var(--space-md);
		border-top: 1px solid var(--color-gray-100);
	}

	.status-update-form {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
		align-items: center;
	}

	.status-select {
		padding: var(--space-sm);
		border: 2px solid var(--color-gray-200);
		border-radius: var(--radius-md);
		font-family: var(--font-body);
	}

	.status-message {
		flex: 1;
		min-width: 200px;
		padding: var(--space-sm);
		border: 2px solid var(--color-gray-200);
		border-radius: var(--radius-md);
	}

	.status-buttons {
		display: flex;
		gap: var(--space-sm);
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-lg);
	}

	.modal {
		background: var(--color-white);
		border-radius: var(--radius-xl);
		width: 100%;
		max-width: 600px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: var(--shadow-lg);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-lg);
		border-bottom: 1px solid var(--color-gray-100);
	}

	.modal-header h3 {
		font-family: var(--font-body);
		font-weight: 600;
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		opacity: 0.5;
	}

	.modal-close:hover {
		opacity: 1;
	}

	.product-form {
		padding: var(--space-lg);
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-md);
	}

	.form-group {
		margin-bottom: var(--space-md);
	}

	.form-group label {
		display: block;
		font-weight: 600;
		margin-bottom: var(--space-xs);
		color: var(--color-gray-700);
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: var(--space-sm);
		border: 2px solid var(--color-gray-200);
		border-radius: var(--radius-md);
		font-family: var(--font-body);
		transition: var(--transition-fast);
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		border-color: var(--color-secondary);
		outline: none;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-md);
		padding-top: var(--space-md);
		border-top: 1px solid var(--color-gray-100);
	}

	/* Responsive */
	@media (max-width: 900px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.actions-grid {
			grid-template-columns: 1fr;
		}

		.order-card-body {
			grid-template-columns: 1fr;
		}

		.form-row {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 600px) {
		.tabs {
			flex-direction: column;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.products-table {
			overflow-x: auto;
		}

		table {
			min-width: 600px;
		}
	}
</style>
