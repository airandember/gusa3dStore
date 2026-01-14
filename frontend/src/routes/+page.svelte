<script lang="ts">
	import { onMount } from 'svelte';
	import { productApi, type Product } from '$lib/api';

	let featuredProducts: Product[] = [];
	let loading = true;

	onMount(async () => {
		try {
			const products = await productApi.getAll();
			featuredProducts = products.slice(0, 6);
		} catch (e) {
			console.error('Failed to load products:', e);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>GUSA3D - Awesome 3D Prints by Kids! 🚀</title>
</svelte:head>

<div class="home">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-bg">
			<span class="floating-emoji" style="top: 10%; left: 10%;">🚀</span>
			<span class="floating-emoji" style="top: 20%; right: 15%;">🦖</span>
			<span class="floating-emoji" style="bottom: 30%; left: 20%;">🎮</span>
			<span class="floating-emoji" style="bottom: 20%; right: 10%;">🦄</span>
			<span class="floating-emoji" style="top: 50%; left: 5%;">⭐</span>
			<span class="floating-emoji" style="top: 40%; right: 25%;">🎨</span>
		</div>
		<div class="container hero-content">
			<h1 class="hero-title">
				<span class="text-gradient">Awesome 3D Prints</span>
				<br />Made by Kids! 🎨
			</h1>
			<p class="hero-subtitle">
				We're a team of young makers aged 11-13 who love creating cool 3D printed stuff! 
				From dragons to rockets, we've got something for everyone! 🌟
			</p>
			<div class="hero-buttons">
				<a href="/shop" class="btn btn-primary btn-lg">
					🛍️ Start Shopping
				</a>
				<a href="/track" class="btn btn-outline btn-lg">
					📦 Track Order
				</a>
			</div>
			<div class="hero-stats">
				<div class="stat">
					<span class="stat-number">50+</span>
					<span class="stat-label">Cool Prints</span>
				</div>
				<div class="stat">
					<span class="stat-number">100+</span>
					<span class="stat-label">Happy Kids</span>
				</div>
				<div class="stat">
					<span class="stat-number">6</span>
					<span class="stat-label">Young Makers</span>
				</div>
			</div>
		</div>
	</section>

	<!-- How It Works -->
	<section class="how-it-works">
		<div class="container">
			<h2 class="section-title">How It Works ✨</h2>
			<div class="steps">
				<div class="step">
					<div class="step-icon">🔍</div>
					<h3>1. Browse</h3>
					<p>Check out our awesome collection of 3D prints!</p>
				</div>
				<div class="step-arrow">→</div>
				<div class="step">
					<div class="step-icon">🛒</div>
					<h3>2. Order</h3>
					<p>Add to cart and checkout - easy peasy!</p>
				</div>
				<div class="step-arrow">→</div>
				<div class="step">
					<div class="step-icon">🖨️</div>
					<h3>3. We Print</h3>
					<p>Our team prints your order with care!</p>
				</div>
				<div class="step-arrow">→</div>
				<div class="step">
					<div class="step-icon">📦</div>
					<h3>4. Delivered!</h3>
					<p>Track it and get your awesome print!</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Featured Products -->
	<section class="featured">
		<div class="container">
			<h2 class="section-title">🌟 Featured Prints</h2>
			{#if loading}
				<div class="loading">
					<span class="loading-spinner">🖨️</span>
					<p>Loading awesome prints...</p>
				</div>
			{:else}
				<div class="products-grid">
					{#each featuredProducts as product}
						<a href="/shop" class="product-card">
							<div class="product-image">
								<span class="product-emoji">
									{#if product.category === 'Fantasy'}🐉
									{:else if product.category === 'Space'}🚀
									{:else if product.category === 'Dinosaurs'}🦖
									{:else if product.category === 'Gaming'}🎮
									{:else if product.category === 'Animals'}🐙
									{:else if product.category === 'Fidgets'}🌀
									{:else if product.category === 'Movies'}🎬
									{:else if product.category === 'Accessories'}🔑
									{:else}📦
									{/if}
								</span>
							</div>
							<div class="product-info">
								<h3>{product.name}</h3>
								<p class="product-creator">by {product.created_by}</p>
								<div class="product-footer">
									<span class="price">{product.price.toFixed(2)}</span>
									<span class="badge badge-secondary">{product.category}</span>
								</div>
							</div>
						</a>
					{/each}
				</div>
				<div class="view-all">
					<a href="/shop" class="btn btn-secondary btn-lg">
						🎨 View All Products
					</a>
				</div>
			{/if}
		</div>
	</section>

	<!-- Meet the Team -->
	<section class="team">
		<div class="container">
			<h2 class="section-title">Meet Our Team! 👋</h2>
			<div class="team-grid">
				<div class="team-member">
					<div class="member-avatar">👧</div>
					<h4>Emma, 12</h4>
					<p>Fantasy & Unicorns Expert</p>
				</div>
				<div class="team-member">
					<div class="member-avatar">👦</div>
					<h4>Jake, 11</h4>
					<p>Space & Rockets Master</p>
				</div>
				<div class="team-member">
					<div class="member-avatar">👧</div>
					<h4>Mia, 13</h4>
					<p>Useful Prints Designer</p>
				</div>
				<div class="team-member">
					<div class="member-avatar">👦</div>
					<h4>Lucas, 12</h4>
					<p>Dinosaur Specialist</p>
				</div>
				<div class="team-member">
					<div class="member-avatar">👧</div>
					<h4>Sophie, 11</h4>
					<p>Gaming & Characters</p>
				</div>
				<div class="team-member">
					<div class="member-avatar">👦</div>
					<h4>Noah, 13</h4>
					<p>Fidgets & Fun Stuff</p>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="cta">
		<div class="container">
			<div class="cta-content">
				<h2>Ready to Get Something Awesome? 🎉</h2>
				<p>Check out our shop and find the perfect 3D print for you or your friends!</p>
				<a href="/shop" class="btn btn-accent btn-lg">
					🛍️ Shop Now!
				</a>
			</div>
		</div>
	</section>
</div>

<style>
	.home {
		overflow: hidden;
	}

	/* Hero Section */
	.hero {
		position: relative;
		padding: var(--space-2xl) 0;
		background: linear-gradient(180deg, rgba(102, 126, 234, 0.1) 0%, transparent 100%);
		overflow: hidden;
	}

	.hero-bg {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.floating-emoji {
		position: absolute;
		font-size: 3rem;
		animation: float 4s ease-in-out infinite;
		opacity: 0.6;
	}

	.floating-emoji:nth-child(2) { animation-delay: 0.5s; }
	.floating-emoji:nth-child(3) { animation-delay: 1s; }
	.floating-emoji:nth-child(4) { animation-delay: 1.5s; }
	.floating-emoji:nth-child(5) { animation-delay: 2s; }
	.floating-emoji:nth-child(6) { animation-delay: 2.5s; }

	.hero-content {
		position: relative;
		text-align: center;
		z-index: 1;
	}

	.hero-title {
		font-size: 3.5rem;
		margin-bottom: var(--space-lg);
		line-height: 1.2;
	}

	.hero-subtitle {
		font-size: 1.25rem;
		max-width: 600px;
		margin: 0 auto var(--space-xl);
		color: var(--color-gray-600);
	}

	.hero-buttons {
		display: flex;
		gap: var(--space-md);
		justify-content: center;
		flex-wrap: wrap;
		margin-bottom: var(--space-2xl);
	}

	.hero-stats {
		display: flex;
		justify-content: center;
		gap: var(--space-2xl);
	}

	.stat {
		text-align: center;
	}

	.stat-number {
		display: block;
		font-family: var(--font-display);
		font-size: 2.5rem;
		color: var(--color-primary);
	}

	.stat-label {
		font-size: 0.875rem;
		color: var(--color-gray-500);
		font-weight: 500;
	}

	/* How It Works */
	.how-it-works {
		padding: var(--space-2xl) 0;
		background: var(--color-white);
	}

	.section-title {
		text-align: center;
		margin-bottom: var(--space-xl);
	}

	.steps {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.step {
		text-align: center;
		padding: var(--space-lg);
		background: var(--color-light);
		border-radius: var(--radius-lg);
		flex: 1;
		min-width: 180px;
		max-width: 220px;
		transition: var(--transition-bounce);
	}

	.step:hover {
		transform: translateY(-5px);
		background: var(--color-white);
		box-shadow: var(--shadow-md);
	}

	.step-icon {
		font-size: 3rem;
		margin-bottom: var(--space-sm);
	}

	.step h3 {
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 1.125rem;
		margin-bottom: var(--space-xs);
	}

	.step p {
		font-size: 0.875rem;
	}

	.step-arrow {
		font-size: 2rem;
		color: var(--color-secondary);
	}

	/* Featured Products */
	.featured {
		padding: var(--space-2xl) 0;
	}

	.products-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-lg);
	}

	.product-card {
		background: var(--color-white);
		border-radius: var(--radius-lg);
		overflow: hidden;
		text-decoration: none;
		box-shadow: var(--shadow-sm);
		transition: var(--transition-bounce);
	}

	.product-card:hover {
		transform: translateY(-8px) rotate(1deg);
		box-shadow: var(--shadow-lg);
	}

	.product-image {
		height: 150px;
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.product-card:nth-child(2) .product-image {
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
	}

	.product-card:nth-child(3) .product-image {
		background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
	}

	.product-card:nth-child(4) .product-image {
		background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
	}

	.product-card:nth-child(5) .product-image {
		background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
	}

	.product-card:nth-child(6) .product-image {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.product-emoji {
		font-size: 4rem;
		animation: float 3s ease-in-out infinite;
	}

	.product-info {
		padding: var(--space-md);
	}

	.product-info h3 {
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 1.125rem;
		color: var(--color-gray-800);
		margin-bottom: var(--space-xs);
	}

	.product-creator {
		font-size: 0.875rem;
		color: var(--color-gray-500);
		margin-bottom: var(--space-sm);
	}

	.product-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.view-all {
		text-align: center;
		margin-top: var(--space-xl);
	}

	.loading {
		text-align: center;
		padding: var(--space-2xl);
	}

	.loading-spinner {
		display: inline-block;
		font-size: 3rem;
		animation: pulse 1s infinite;
	}

	/* Team Section */
	.team {
		padding: var(--space-2xl) 0;
		background: var(--color-white);
	}

	.team-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: var(--space-lg);
	}

	.team-member {
		text-align: center;
		padding: var(--space-lg);
		background: var(--color-light);
		border-radius: var(--radius-lg);
		transition: var(--transition-bounce);
	}

	.team-member:hover {
		transform: scale(1.05);
		background: var(--color-white);
		box-shadow: var(--shadow-md);
	}

	.member-avatar {
		font-size: 3rem;
		margin-bottom: var(--space-sm);
	}

	.team-member h4 {
		font-family: var(--font-body);
		font-weight: 600;
		color: var(--color-gray-800);
		margin-bottom: var(--space-xs);
	}

	.team-member p {
		font-size: 0.75rem;
		color: var(--color-gray-500);
	}

	/* CTA Section */
	.cta {
		padding: var(--space-2xl) 0;
	}

	.cta-content {
		text-align: center;
		padding: var(--space-2xl);
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: var(--radius-xl);
		color: var(--color-white);
	}

	.cta h2 {
		color: var(--color-white);
		margin-bottom: var(--space-md);
	}

	.cta p {
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: var(--space-lg);
		font-size: 1.125rem;
	}

	/* Responsive */
	@media (max-width: 1024px) {
		.team-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (max-width: 768px) {
		.hero-title {
			font-size: 2.5rem;
		}

		.products-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.team-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.step-arrow {
			display: none;
		}

		.hero-stats {
			gap: var(--space-lg);
		}
	}

	@media (max-width: 480px) {
		.products-grid {
			grid-template-columns: 1fr;
		}

		.team-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
