<script lang="ts">
	import { cart, cartTotal, toasts } from '$lib/stores';
	import { cartApi, orderApi } from '$lib/api';
	import { goto } from '$app/navigation';

	let showCheckout = false;
	let submitting = false;
	let orderComplete = false;
	let orderDetails: { tracking_code: string; id: number } | null = null;

	let customerName = '';
	let customerEmail = '';
	let address = '';

	async function updateQuantity(itemId: number, newQuantity: number) {
		try {
			if (newQuantity <= 0) {
				await cartApi.remove(itemId);
				cart.removeItem(itemId);
				toasts.show('Item removed from cart', 'info');
			} else {
				await cartApi.update(itemId, newQuantity);
				cart.updateQuantity(itemId, newQuantity);
			}
		} catch (e) {
			toasts.show('Failed to update cart', 'error');
		}
	}

	async function removeItem(itemId: number) {
		try {
			await cartApi.remove(itemId);
			cart.removeItem(itemId);
			toasts.show('Item removed from cart', 'info');
		} catch (e) {
			toasts.show('Failed to remove item', 'error');
		}
	}

	async function placeOrder() {
		if (!customerName || !customerEmail || !address) {
			toasts.show('Please fill in all fields', 'error');
			return;
		}

		submitting = true;
		try {
			const order = await orderApi.create({
				customer_name: customerName,
				customer_email: customerEmail,
				address: address
			});
			
			orderDetails = {
				tracking_code: order.tracking_code,
				id: order.id
			};
			orderComplete = true;
			cart.clear();
			toasts.show('Order placed successfully! 🎉', 'success');
		} catch (e) {
			toasts.show('Failed to place order', 'error');
		} finally {
			submitting = false;
		}
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
	<title>Cart - 3D Kids Print Shop 🛒</title>
</svelte:head>

<div class="cart-page">
	<div class="container">
		{#if orderComplete && orderDetails}
			<!-- Order Success -->
			<div class="order-success">
				<div class="success-content">
					<span class="success-icon">🎉</span>
					<h1>Awesome! Your Order is Placed!</h1>
					<p>Thanks for shopping with us! We're super excited to make your prints!</p>
					
					<div class="tracking-info">
						<h3>Your Tracking Code:</h3>
						<div class="tracking-code">{orderDetails.tracking_code}</div>
						<p class="tracking-hint">Save this code to track your order!</p>
					</div>

					<div class="success-actions">
						<a href="/track" class="btn btn-primary btn-lg">
							📦 Track My Order
						</a>
						<a href="/shop" class="btn btn-secondary btn-lg">
							🛍️ Keep Shopping
						</a>
					</div>
				</div>
			</div>
		{:else if $cart.length === 0}
			<!-- Empty Cart -->
			<div class="empty-cart">
				<span class="empty-icon">🛒</span>
				<h2>Your cart is empty!</h2>
				<p>Looks like you haven't added any awesome prints yet!</p>
				<a href="/shop" class="btn btn-primary btn-lg">
					🎨 Start Shopping
				</a>
			</div>
		{:else}
			<!-- Cart Content -->
			<div class="cart-header">
				<h1>🛒 Your Cart</h1>
				<p>{$cart.length} {$cart.length === 1 ? 'item' : 'items'} in your cart</p>
			</div>

			<div class="cart-layout">
				<div class="cart-items">
					{#each $cart as item (item.id)}
						<div class="cart-item">
							<div class="item-image">
								<span class="item-emoji">{getCategoryEmoji(item.product.category)}</span>
							</div>
							<div class="item-details">
								<h3>{item.product.name}</h3>
								<p class="item-meta">
									<span>by {item.product.created_by}</span>
									<span class="badge badge-secondary">{item.product.category}</span>
								</p>
								<p class="item-price">
									<span class="price">{item.product.price.toFixed(2)}</span>
									<span class="per-item">each</span>
								</p>
							</div>
							<div class="item-quantity">
								<button 
									class="qty-btn"
									on:click={() => updateQuantity(item.id, item.quantity - 1)}
								>
									-
								</button>
								<span class="qty-value">{item.quantity}</span>
								<button 
									class="qty-btn"
									on:click={() => updateQuantity(item.id, item.quantity + 1)}
								>
									+
								</button>
							</div>
							<div class="item-total">
								<span class="price">{(item.product.price * item.quantity).toFixed(2)}</span>
							</div>
							<button class="remove-btn" on:click={() => removeItem(item.id)}>
								🗑️
							</button>
						</div>
					{/each}
				</div>

				<div class="cart-summary">
					{#if !showCheckout}
						<!-- Summary View -->
						<div class="summary-card">
							<h3>Order Summary</h3>
							<div class="summary-row">
								<span>Subtotal</span>
								<span class="price">{$cartTotal.toFixed(2)}</span>
							</div>
							<div class="summary-row">
								<span>Shipping</span>
								<span class="free">FREE! 🎉</span>
							</div>
							<div class="summary-divider"></div>
							<div class="summary-row total">
								<span>Total</span>
								<span class="price">{$cartTotal.toFixed(2)}</span>
							</div>
							<button 
								class="btn btn-primary btn-lg checkout-btn"
								on:click={() => showCheckout = true}
							>
								🚀 Proceed to Checkout
							</button>
							<a href="/shop" class="continue-shopping">
								← Continue Shopping
							</a>
						</div>
					{:else}
						<!-- Checkout Form -->
						<div class="checkout-card">
							<h3>📝 Checkout</h3>
							<form on:submit|preventDefault={placeOrder}>
								<div class="form-group">
									<label for="name">Your Name</label>
									<input 
										type="text" 
										id="name" 
										bind:value={customerName}
										placeholder="What's your name?"
										required
									/>
								</div>
								<div class="form-group">
									<label for="email">Email</label>
									<input 
										type="email" 
										id="email" 
										bind:value={customerEmail}
										placeholder="your@email.com"
										required
									/>
								</div>
								<div class="form-group">
									<label for="address">Delivery Address</label>
									<textarea 
										id="address" 
										bind:value={address}
										placeholder="Where should we send your awesome prints?"
										rows="3"
										required
									></textarea>
								</div>

								<div class="summary-divider"></div>
								
								<div class="summary-row total">
									<span>Total to Pay</span>
									<span class="price">{$cartTotal.toFixed(2)}</span>
								</div>

								<div class="payment-note">
									<span>💳</span>
									<p>Demo mode - no real payment needed!</p>
								</div>

								<button 
									type="submit"
									class="btn btn-primary btn-lg checkout-btn"
									disabled={submitting}
								>
									{#if submitting}
										🔄 Placing Order...
									{:else}
										✨ Place Order
									{/if}
								</button>

								<button 
									type="button"
									class="back-btn"
									on:click={() => showCheckout = false}
								>
									← Back to Cart
								</button>
							</form>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.cart-page {
		min-height: 60vh;
	}

	.cart-header {
		text-align: center;
		margin-bottom: var(--space-xl);
	}

	.cart-header h1 {
		margin-bottom: var(--space-sm);
	}

	/* Empty Cart */
	.empty-cart {
		text-align: center;
		padding: var(--space-2xl);
		background: var(--color-white);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
	}

	.empty-icon {
		display: block;
		font-size: 5rem;
		margin-bottom: var(--space-lg);
		opacity: 0.5;
	}

	.empty-cart h2 {
		margin-bottom: var(--space-sm);
	}

	.empty-cart p {
		margin-bottom: var(--space-lg);
	}

	/* Cart Layout */
	.cart-layout {
		display: grid;
		grid-template-columns: 1fr 380px;
		gap: var(--space-xl);
		align-items: start;
	}

	/* Cart Items */
	.cart-items {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.cart-item {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		background: var(--color-white);
		padding: var(--space-md);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		transition: var(--transition-bounce);
	}

	.cart-item:hover {
		box-shadow: var(--shadow-md);
	}

	.item-image {
		width: 80px;
		height: 80px;
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.item-emoji {
		font-size: 2.5rem;
	}

	.item-details {
		flex: 1;
	}

	.item-details h3 {
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 1.125rem;
		margin-bottom: var(--space-xs);
	}

	.item-meta {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: 0.875rem;
		color: var(--color-gray-500);
		margin-bottom: var(--space-xs);
	}

	.item-price {
		display: flex;
		align-items: baseline;
		gap: var(--space-xs);
	}

	.item-price .price {
		font-size: 1rem;
	}

	.per-item {
		font-size: 0.75rem;
		color: var(--color-gray-400);
	}

	.item-quantity {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		background: var(--color-light);
		padding: var(--space-xs);
		border-radius: var(--radius-full);
	}

	.qty-btn {
		width: 32px;
		height: 32px;
		border: none;
		background: var(--color-white);
		border-radius: 50%;
		font-size: 1.25rem;
		font-weight: 600;
		cursor: pointer;
		transition: var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.qty-btn:hover {
		background: var(--color-secondary);
		color: var(--color-white);
	}

	.qty-value {
		font-weight: 600;
		min-width: 24px;
		text-align: center;
	}

	.item-total .price {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.remove-btn {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		opacity: 0.5;
		transition: var(--transition-fast);
		padding: var(--space-sm);
	}

	.remove-btn:hover {
		opacity: 1;
		transform: scale(1.2);
	}

	/* Summary Card */
	.summary-card, .checkout-card {
		background: var(--color-white);
		padding: var(--space-lg);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		position: sticky;
		top: 100px;
	}

	.summary-card h3, .checkout-card h3 {
		font-family: var(--font-body);
		font-weight: 600;
		margin-bottom: var(--space-lg);
		text-align: center;
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: var(--space-sm);
	}

	.summary-row.total {
		font-weight: 600;
		font-size: 1.125rem;
	}

	.free {
		color: var(--color-green);
		font-weight: 600;
	}

	.summary-divider {
		height: 1px;
		background: var(--color-gray-200);
		margin: var(--space-md) 0;
	}

	.checkout-btn {
		width: 100%;
		margin-top: var(--space-md);
	}

	.continue-shopping, .back-btn {
		display: block;
		text-align: center;
		margin-top: var(--space-md);
		color: var(--color-gray-500);
		font-size: 0.875rem;
		background: none;
		border: none;
		cursor: pointer;
		width: 100%;
	}

	.continue-shopping:hover, .back-btn:hover {
		color: var(--color-primary);
	}

	/* Checkout Form */
	.form-group {
		margin-bottom: var(--space-md);
	}

	.form-group label {
		display: block;
		font-weight: 600;
		margin-bottom: var(--space-xs);
		color: var(--color-gray-700);
	}

	.form-group input, .form-group textarea {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: 2px solid var(--color-gray-200);
		border-radius: var(--radius-md);
		font-size: 1rem;
		transition: var(--transition-fast);
	}

	.form-group input:focus, .form-group textarea:focus {
		border-color: var(--color-secondary);
		outline: none;
		box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
	}

	.payment-note {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--color-accent);
		border-radius: var(--radius-md);
		margin-top: var(--space-md);
	}

	.payment-note span {
		font-size: 1.5rem;
	}

	.payment-note p {
		font-size: 0.875rem;
		color: var(--color-gray-700);
	}

	/* Order Success */
	.order-success {
		text-align: center;
		padding: var(--space-2xl);
	}

	.success-content {
		background: var(--color-white);
		padding: var(--space-2xl);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
		max-width: 600px;
		margin: 0 auto;
	}

	.success-icon {
		display: block;
		font-size: 5rem;
		margin-bottom: var(--space-lg);
		animation: pulse 2s infinite;
	}

	.success-content h1 {
		margin-bottom: var(--space-md);
	}

	.success-content > p {
		font-size: 1.125rem;
		margin-bottom: var(--space-xl);
	}

	.tracking-info {
		background: var(--color-light);
		padding: var(--space-lg);
		border-radius: var(--radius-lg);
		margin-bottom: var(--space-xl);
	}

	.tracking-info h3 {
		font-family: var(--font-body);
		margin-bottom: var(--space-sm);
	}

	.tracking-code {
		font-family: var(--font-display);
		font-size: 2rem;
		color: var(--color-primary);
		margin-bottom: var(--space-sm);
	}

	.tracking-hint {
		font-size: 0.875rem;
		color: var(--color-gray-500);
	}

	.success-actions {
		display: flex;
		gap: var(--space-md);
		justify-content: center;
		flex-wrap: wrap;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.cart-layout {
			grid-template-columns: 1fr;
		}

		.summary-card, .checkout-card {
			position: static;
		}
	}

	@media (max-width: 600px) {
		.cart-item {
			flex-wrap: wrap;
		}

		.item-image {
			width: 60px;
			height: 60px;
		}

		.item-emoji {
			font-size: 2rem;
		}

		.item-details {
			flex: 1 1 calc(100% - 80px);
		}

		.item-quantity {
			order: 4;
		}

		.item-total {
			order: 5;
		}

		.remove-btn {
			order: 6;
		}
	}
</style>
