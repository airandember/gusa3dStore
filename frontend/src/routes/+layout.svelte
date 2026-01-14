<script lang="ts">
	import '../app.css';
	import { cartCount, toasts } from '$lib/stores';
	import { onMount } from 'svelte';
	import { cartApi } from '$lib/api';
	import { cart } from '$lib/stores';
	import { auth, isLoggedIn } from '$lib/auth';

	let mobileMenuOpen = false;

	onMount(async () => {
		// Initialize auth
		await auth.initialize();
		
		// Load cart
		try {
			const items = await cartApi.get();
			cart.set(items);
		} catch (e) {
			console.error('Failed to load cart:', e);
		}
	});

	async function handleLogout() {
		try {
			await auth.signOut();
			toasts.show('Logged out successfully', 'info');
		} catch (e) {
			console.error('Logout error:', e);
		}
	}
</script>

<div class="app-wrapper">
	<!-- Fun Header -->
	<header class="header">
		<div class="container">
			<nav class="nav">
				<a href="/" class="logo">
					<span class="logo-icon">🖨️</span>
					<span class="logo-text">GUSA3D</span>
				</a>
				
				<button class="mobile-menu-btn" on:click={() => mobileMenuOpen = !mobileMenuOpen}>
					{mobileMenuOpen ? '✕' : '☰'}
				</button>

				<div class="nav-links" class:open={mobileMenuOpen}>
					<a href="/" class="nav-link">
						<span class="nav-icon">🏠</span>
						<span>Home</span>
					</a>
					<a href="/shop" class="nav-link">
						<span class="nav-icon">🎨</span>
						<span>Shop</span>
					</a>
					<a href="/track" class="nav-link">
						<span class="nav-icon">📦</span>
						<span>Track Order</span>
					</a>
					{#if $isLoggedIn}
					<a href="/admin" class="nav-link admin-link">
						<span class="nav-icon">⚙️</span>
						<span>Admin</span>
					</a>
					<button class="nav-link logout-btn" on:click={handleLogout}>
						<span class="nav-icon">🚪</span>
						<span>Logout</span>
					</button>
				{:else}
					<a href="/admin/login" class="nav-link admin-link">
						<span class="nav-icon">🔐</span>
						<span>Admin</span>
					</a>
				{/if}
					<a href="/cart" class="nav-link cart-link">
						<span class="cart-icon">🛒</span>
						{#if $cartCount > 0}
							<span class="cart-badge">{$cartCount}</span>
						{/if}
					</a>
				</div>
			</nav>
		</div>
	</header>

	<!-- Main Content -->
	<main class="main-content">
		<slot />
	</main>

	<!-- Fun Footer -->
	<footer class="footer">
		<div class="container">
			<div class="footer-content">
				<div class="footer-brand">
					<span class="footer-logo">🖨️ GUSA3D</span>
					<p>Made with ❤️ by kids, for kids!</p>
				</div>
				<div class="footer-links">
					<span>🎮 Gaming</span>
					<span>🦖 Dinosaurs</span>
					<span>🚀 Space</span>
					<span>🦄 Fantasy</span>
				</div>
				<div class="footer-social">
					<span class="social-icon">📸</span>
					<span class="social-icon">📺</span>
					<span class="social-icon">🎵</span>
				</div>
			</div>
			<div class="footer-bottom">
				<p>© 2026 GUSA3D - All prints made by awesome kids aged 11-13! 🌟</p>
			</div>
		</div>
	</footer>

	<!-- Toast Notifications -->
	<div class="toast-container">
		{#each $toasts as toast (toast.id)}
			<div class="toast toast-{toast.type}" on:click={() => toasts.dismiss(toast.id)}>
				<span class="toast-icon">
					{#if toast.type === 'success'}✅{:else if toast.type === 'error'}❌{:else}ℹ️{/if}
				</span>
				<span class="toast-message">{toast.message}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.app-wrapper {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	/* Header */
	.header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: var(--space-md) 0;
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
	}

	.nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		text-decoration: none;
		color: var(--color-white);
	}

	.logo-icon {
		font-size: 2rem;
		animation: float 3s ease-in-out infinite;
	}

	.logo-text {
		font-family: var(--font-display);
		font-size: 1.5rem;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
	}

	.mobile-menu-btn {
		display: none;
		background: none;
		border: none;
		font-size: 1.5rem;
		color: var(--color-white);
		cursor: pointer;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-md);
		color: var(--color-white);
		text-decoration: none;
		border-radius: var(--radius-full);
		font-weight: 500;
		transition: var(--transition-bounce);
	}

	.nav-link:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-2px);
	}

	.nav-icon {
		font-size: 1.25rem;
	}

	.admin-link {
		background: rgba(255, 230, 109, 0.3);
	}

	.cart-link {
		position: relative;
		background: var(--color-accent);
		color: var(--color-gray-800);
	}

	.cart-icon {
		font-size: 1.25rem;
	}

	.cart-badge {
		position: absolute;
		top: -5px;
		right: -5px;
		background: var(--color-primary);
		color: var(--color-white);
		font-size: 0.75rem;
		font-weight: 700;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: pulse 2s infinite;
	}

	/* Main Content */
	.main-content {
		flex: 1;
		padding: var(--space-xl) 0;
	}

	/* Footer */
	.footer {
		background: var(--color-gray-800);
		color: var(--color-white);
		padding: var(--space-xl) 0 var(--space-md);
		margin-top: auto;
	}

	.footer-content {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-xl);
		margin-bottom: var(--space-lg);
	}

	.footer-brand {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.footer-logo {
		font-family: var(--font-display);
		font-size: 1.25rem;
	}

	.footer-brand p {
		color: var(--color-gray-400);
		font-size: 0.875rem;
	}

	.footer-links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
		justify-content: center;
		align-items: center;
	}

	.footer-links span {
		background: var(--color-gray-700);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-full);
		font-size: 0.875rem;
	}

	.footer-social {
		display: flex;
		gap: var(--space-md);
		justify-content: flex-end;
	}

	.social-icon {
		font-size: 1.5rem;
		cursor: pointer;
		transition: var(--transition-bounce);
	}

	.social-icon:hover {
		transform: scale(1.2) rotate(10deg);
	}

	.footer-bottom {
		text-align: center;
		padding-top: var(--space-lg);
		border-top: 1px solid var(--color-gray-700);
	}

	.footer-bottom p {
		color: var(--color-gray-500);
		font-size: 0.875rem;
	}

	/* Toast Notifications */
	.toast-container {
		position: fixed;
		bottom: var(--space-lg);
		right: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		z-index: 1000;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md) var(--space-lg);
		background: var(--color-white);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		cursor: pointer;
		animation: slideIn 0.3s ease-out;
	}

	.toast-success { border-left: 4px solid var(--color-green); }
	.toast-error { border-left: 4px solid var(--color-primary); }
	.toast-info { border-left: 4px solid var(--color-blue); }

	.toast-icon { font-size: 1.25rem; }
	.toast-message { font-weight: 500; }

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.mobile-menu-btn {
			display: block;
		}

		.nav-links {
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
			flex-direction: column;
			padding: var(--space-md);
			gap: var(--space-xs);
			display: none;
		}

		.nav-links.open {
			display: flex;
		}

		.nav-link {
			width: 100%;
			justify-content: center;
		}

		.footer-content {
			grid-template-columns: 1fr;
			text-align: center;
		}

		.footer-social {
			justify-content: center;
		}
	}
</style>
