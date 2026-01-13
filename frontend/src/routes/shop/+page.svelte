<script lang="ts">
	import { onMount } from 'svelte';
	import { productApi, cartApi, type Product } from '$lib/api';
	import { cart, toasts, categories, selectedCategory } from '$lib/stores';

	let products: Product[] = [];
	let filteredProducts: Product[] = [];
	let loading = true;
	let addingToCart: number | null = null;

	$: {
		if ($selectedCategory === 'All') {
			filteredProducts = products;
		} else {
			filteredProducts = products.filter(p => p.category === $selectedCategory);
		}
	}

	onMount(async () => {
		try {
			products = await productApi.getAll();
			filteredProducts = products;
		} catch (e) {
			console.error('Failed to load products:', e);
			toasts.show('Failed to load products', 'error');
		} finally {
			loading = false;
		}
	});

	async function addToCart(product: Product) {
		addingToCart = product.id;
		try {
			await cartApi.add(product.id, 1);
			const items = await cartApi.get();
			cart.set(items);
			toasts.show(`Added ${product.name} to cart! 🎉`, 'success');
		} catch (e) {
			toasts.show('Failed to add to cart', 'error');
		} finally {
			addingToCart = null;
		}
	}

	function getCategoryEmoji(category: string): string {
		const emojis: Record<string, string> = {
			'All': '🎨',
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

	function getProductGradient(index: number): string {
		const gradients = [
			'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
			'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
			'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
			'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
			'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
			'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
			'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
			'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
		];
		return gradients[index % gradients.length];
	}
</script>

<svelte:head>
	<title>Shop - 3D Kids Print Shop 🛍️</title>
</svelte:head>

<div class="shop">
	<div class="container">
		<!-- Header -->
		<div class="shop-header">
			<h1>🎨 Our Print Shop</h1>
			<p>Browse all our awesome 3D printed creations!</p>
		</div>

		<!-- Category Filter -->
		<div class="categories">
			{#each $categories as category}
				<button
					class="category-btn"
					class:active={$selectedCategory === category}
					on:click={() => selectedCategory.set(category)}
				>
					<span class="category-emoji">{getCategoryEmoji(category)}</span>
					<span>{category}</span>
				</button>
			{/each}
		</div>

		<!-- Products Grid -->
		{#if loading}
			<div class="loading">
				<span class="loading-spinner">🖨️</span>
				<p>Loading awesome prints...</p>
			</div>
		{:else if filteredProducts.length === 0}
			<div class="no-products">
				<span class="no-products-emoji">🔍</span>
				<h3>No products found</h3>
				<p>Try selecting a different category!</p>
			</div>
		{:else}
			<div class="products-grid">
				{#each filteredProducts as product, index}
					<div class="product-card">
						<div class="product-image" style="background: {getProductGradient(index)}">
							<span class="product-emoji">{getCategoryEmoji(product.category)}</span>
							{#if product.in_stock < 5}
								<span class="low-stock-badge">Only {product.in_stock} left!</span>
							{/if}
						</div>
						<div class="product-content">
							<div class="product-header">
								<h3>{product.name}</h3>
								<span class="badge badge-secondary">{product.category}</span>
							</div>
							<p class="product-description">{product.description}</p>
							<div class="product-meta">
								<span class="meta-item">
									<span class="meta-icon">⏱️</span>
									{product.print_time}
								</span>
								<span class="meta-item">
									<span class="meta-icon">👤</span>
									{product.created_by}
								</span>
							</div>
							<div class="product-footer">
								<span class="price">{product.price.toFixed(2)}</span>
								<button
									class="btn btn-primary add-to-cart-btn"
									on:click={() => addToCart(product)}
									disabled={addingToCart === product.id || product.in_stock === 0}
								>
									{#if addingToCart === product.id}
										<span class="btn-spinner">🔄</span>
									{:else if product.in_stock === 0}
										Out of Stock
									{:else}
										🛒 Add to Cart
									{/if}
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.shop {
		min-height: 60vh;
	}

	.shop-header {
		text-align: center;
		margin-bottom: var(--space-xl);
	}

	.shop-header h1 {
		margin-bottom: var(--space-sm);
	}

	.shop-header p {
		font-size: 1.125rem;
	}

	/* Categories */
	.categories {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		justify-content: center;
		margin-bottom: var(--space-xl);
		padding: var(--space-md);
		background: var(--color-white);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
	}

	.category-btn {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-light);
		border: 2px solid transparent;
		border-radius: var(--radius-full);
		font-family: var(--font-body);
		font-weight: 500;
		cursor: pointer;
		transition: var(--transition-bounce);
	}

	.category-btn:hover {
		background: var(--color-gray-100);
		transform: translateY(-2px);
	}

	.category-btn.active {
		background: var(--color-primary);
		color: var(--color-white);
		box-shadow: 0 4px 14px rgba(255, 107, 107, 0.4);
	}

	.category-emoji {
		font-size: 1.25rem;
	}

	/* Products Grid */
	.products-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-lg);
	}

	.product-card {
		background: var(--color-white);
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
		transition: var(--transition-bounce);
		display: flex;
		flex-direction: column;
	}

	.product-card:hover {
		transform: translateY(-8px);
		box-shadow: var(--shadow-lg);
	}

	.product-image {
		height: 160px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.product-emoji {
		font-size: 4rem;
		animation: float 3s ease-in-out infinite;
	}

	.low-stock-badge {
		position: absolute;
		top: var(--space-sm);
		right: var(--space-sm);
		background: var(--color-primary);
		color: var(--color-white);
		font-size: 0.75rem;
		font-weight: 600;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-full);
	}

	.product-content {
		padding: var(--space-md);
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.product-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-sm);
		margin-bottom: var(--space-sm);
	}

	.product-header h3 {
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 1.125rem;
		color: var(--color-gray-800);
		line-height: 1.3;
	}

	.product-description {
		font-size: 0.875rem;
		color: var(--color-gray-600);
		margin-bottom: var(--space-md);
		flex: 1;
	}

	.product-meta {
		display: flex;
		gap: var(--space-md);
		margin-bottom: var(--space-md);
		flex-wrap: wrap;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: 0.8rem;
		color: var(--color-gray-500);
	}

	.product-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: var(--space-md);
		border-top: 1px solid var(--color-gray-100);
	}

	.add-to-cart-btn {
		font-size: 0.875rem;
		padding: var(--space-sm) var(--space-md);
	}

	.add-to-cart-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-spinner {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* Loading & Empty States */
	.loading, .no-products {
		text-align: center;
		padding: var(--space-2xl);
	}

	.loading-spinner, .no-products-emoji {
		display: block;
		font-size: 4rem;
		margin-bottom: var(--space-md);
	}

	.loading-spinner {
		animation: pulse 1s infinite;
	}

	.no-products h3 {
		margin-bottom: var(--space-sm);
	}

	/* Responsive */
	@media (max-width: 1200px) {
		.products-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (max-width: 900px) {
		.products-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 600px) {
		.products-grid {
			grid-template-columns: 1fr;
		}

		.categories {
			gap: var(--space-xs);
		}

		.category-btn {
			padding: var(--space-xs) var(--space-sm);
			font-size: 0.875rem;
		}
	}
</style>
