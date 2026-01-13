<script lang="ts">
	import { orderApi, type TrackingResponse } from '$lib/api';
	import { toasts } from '$lib/stores';

	let trackingCode = '';
	let searching = false;
	let trackingResult: TrackingResponse | null = null;
	let notFound = false;

	async function trackOrder() {
		if (!trackingCode.trim()) {
			toasts.show('Please enter a tracking code', 'error');
			return;
		}

		searching = true;
		notFound = false;
		trackingResult = null;

		try {
			trackingResult = await orderApi.track(trackingCode.trim());
		} catch (e) {
			notFound = true;
			toasts.show('Order not found', 'error');
		} finally {
			searching = false;
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

	function getStatusLabel(status: string): string {
		const labels: Record<string, string> = {
			'pending': 'Order Received',
			'confirmed': 'Confirmed',
			'printing': 'Printing',
			'quality_check': 'Quality Check',
			'ready': 'Ready to Ship',
			'shipped': 'On the Way',
			'delivered': 'Delivered'
		};
		return labels[status] || status;
	}

	function getStatusColor(status: string): string {
		const colors: Record<string, string> = {
			'pending': 'var(--color-orange)',
			'confirmed': 'var(--color-blue)',
			'printing': 'var(--color-purple)',
			'quality_check': 'var(--color-cyan)',
			'ready': 'var(--color-secondary)',
			'shipped': 'var(--color-blue)',
			'delivered': 'var(--color-green)'
		};
		return colors[status] || 'var(--color-gray-400)';
	}

	const statusOrder = ['pending', 'confirmed', 'printing', 'quality_check', 'ready', 'shipped', 'delivered'];

	function getProgressPercent(status: string): number {
		const index = statusOrder.indexOf(status);
		if (index === -1) return 0;
		return ((index + 1) / statusOrder.length) * 100;
	}
</script>

<svelte:head>
	<title>Track Order - 3D Kids Print Shop 📦</title>
</svelte:head>

<div class="track-page">
	<div class="container">
		<!-- Header -->
		<div class="track-header">
			<h1>📦 Track Your Order</h1>
			<p>Enter your tracking code to see where your awesome print is!</p>
		</div>

		<!-- Search Form -->
		<div class="search-section">
			<form on:submit|preventDefault={trackOrder} class="search-form">
				<div class="search-input-wrapper">
					<span class="search-icon">🔍</span>
					<input
						type="text"
						bind:value={trackingCode}
						placeholder="Enter tracking code (e.g., 3DK-12345-678)"
						class="search-input"
					/>
				</div>
				<button type="submit" class="btn btn-primary btn-lg" disabled={searching}>
					{#if searching}
						🔄 Searching...
					{:else}
						Track Order
					{/if}
				</button>
			</form>
		</div>

		<!-- Not Found -->
		{#if notFound}
			<div class="not-found">
				<span class="not-found-emoji">🤔</span>
				<h3>Order Not Found</h3>
				<p>We couldn't find an order with that tracking code. Double-check and try again!</p>
			</div>
		{/if}

		<!-- Tracking Result -->
		{#if trackingResult}
			<div class="tracking-result">
				<!-- Order Summary Card -->
				<div class="order-card">
					<div class="order-header">
						<div>
							<h2>Order #{trackingResult.order.id}</h2>
							<p class="tracking-code-display">{trackingResult.order.tracking_code}</p>
						</div>
						<div class="status-badge" style="background: {getStatusColor(trackingResult.order.status)}">
							{getStatusEmoji(trackingResult.order.status)} {getStatusLabel(trackingResult.order.status)}
						</div>
					</div>

					<!-- Progress Bar -->
					<div class="progress-section">
						<div class="progress-bar">
							<div 
								class="progress-fill" 
								style="width: {getProgressPercent(trackingResult.order.status)}%"
							></div>
						</div>
						<div class="progress-steps">
							{#each statusOrder as status}
								<div 
									class="progress-step"
									class:active={statusOrder.indexOf(status) <= statusOrder.indexOf(trackingResult.order.status)}
								>
									<span class="step-emoji">{getStatusEmoji(status)}</span>
									<span class="step-label">{getStatusLabel(status)}</span>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Order Details -->
				<div class="details-grid">
					<!-- Items -->
					<div class="detail-card">
						<h3>🎁 Order Items</h3>
						<div class="items-list">
							{#each trackingResult.order.items as item}
								<div class="order-item">
									<span class="item-qty">{item.quantity}x</span>
									<span class="item-name">{item.product_name}</span>
									<span class="item-price">${(item.price * item.quantity).toFixed(2)}</span>
								</div>
							{/each}
						</div>
						<div class="order-total">
							<span>Total</span>
							<span class="price">{trackingResult.order.total.toFixed(2)}</span>
						</div>
					</div>

					<!-- Delivery Info -->
					<div class="detail-card">
						<h3>📍 Delivery Info</h3>
						<div class="info-row">
							<span class="info-label">Name</span>
							<span class="info-value">{trackingResult.order.customer_name}</span>
						</div>
						<div class="info-row">
							<span class="info-label">Email</span>
							<span class="info-value">{trackingResult.order.customer_email}</span>
						</div>
						<div class="info-row">
							<span class="info-label">Address</span>
							<span class="info-value">{trackingResult.order.address}</span>
						</div>
					</div>

					<!-- Status History -->
					<div class="detail-card history-card">
						<h3>📜 Status History</h3>
						<div class="history-list">
							{#each trackingResult.status_history as status}
								<div class="history-item">
									<div class="history-dot" style="background: {getStatusColor(status.status)}"></div>
									<div class="history-content">
										<div class="history-header">
											<span class="history-status">
												{getStatusEmoji(status.status)} {getStatusLabel(status.status)}
											</span>
											<span class="history-time">
												{new Date(status.timestamp).toLocaleString()}
											</span>
										</div>
										<p class="history-message">{status.message}</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Help Section -->
		<div class="help-section">
			<h3>❓ Need Help?</h3>
			<p>If you have any questions about your order, just let us know! We're here to help! 💪</p>
			<div class="help-cards">
				<div class="help-card">
					<span class="help-icon">📧</span>
					<h4>Email Us</h4>
					<p>help@3dkidsprint.shop</p>
				</div>
				<div class="help-card">
					<span class="help-icon">💬</span>
					<h4>Ask a Question</h4>
					<p>We respond super fast!</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.track-page {
		min-height: 60vh;
	}

	.track-header {
		text-align: center;
		margin-bottom: var(--space-xl);
	}

	.track-header h1 {
		margin-bottom: var(--space-sm);
	}

	/* Search Section */
	.search-section {
		max-width: 600px;
		margin: 0 auto var(--space-xl);
	}

	.search-form {
		display: flex;
		gap: var(--space-md);
		background: var(--color-white);
		padding: var(--space-md);
		border-radius: var(--radius-full);
		box-shadow: var(--shadow-md);
	}

	.search-input-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		background: var(--color-light);
		padding: 0 var(--space-md);
		border-radius: var(--radius-full);
	}

	.search-icon {
		font-size: 1.25rem;
	}

	.search-input {
		flex: 1;
		border: none;
		background: transparent;
		font-size: 1rem;
		padding: var(--space-sm) 0;
	}

	.search-input:focus {
		outline: none;
	}

	/* Not Found */
	.not-found {
		text-align: center;
		padding: var(--space-2xl);
		background: var(--color-white);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		max-width: 500px;
		margin: 0 auto var(--space-xl);
	}

	.not-found-emoji {
		display: block;
		font-size: 4rem;
		margin-bottom: var(--space-md);
	}

	.not-found h3 {
		margin-bottom: var(--space-sm);
	}

	/* Tracking Result */
	.tracking-result {
		margin-bottom: var(--space-xl);
	}

	/* Order Card */
	.order-card {
		background: var(--color-white);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		box-shadow: var(--shadow-md);
		margin-bottom: var(--space-xl);
	}

	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-xl);
		flex-wrap: wrap;
		gap: var(--space-md);
	}

	.order-header h2 {
		margin-bottom: var(--space-xs);
	}

	.tracking-code-display {
		font-family: monospace;
		font-size: 0.875rem;
		color: var(--color-gray-500);
	}

	.status-badge {
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-full);
		color: var(--color-white);
		font-weight: 600;
		font-size: 1rem;
	}

	/* Progress */
	.progress-section {
		margin-top: var(--space-lg);
	}

	.progress-bar {
		height: 8px;
		background: var(--color-gray-200);
		border-radius: var(--radius-full);
		overflow: hidden;
		margin-bottom: var(--space-lg);
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-secondary), var(--color-green));
		border-radius: var(--radius-full);
		transition: width 0.5s ease;
	}

	.progress-steps {
		display: flex;
		justify-content: space-between;
		overflow-x: auto;
		gap: var(--space-xs);
	}

	.progress-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		min-width: 80px;
		opacity: 0.4;
		transition: var(--transition-fast);
	}

	.progress-step.active {
		opacity: 1;
	}

	.step-emoji {
		font-size: 1.5rem;
		margin-bottom: var(--space-xs);
	}

	.step-label {
		font-size: 0.75rem;
		color: var(--color-gray-600);
		font-weight: 500;
	}

	/* Details Grid */
	.details-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-lg);
	}

	.detail-card {
		background: var(--color-white);
		padding: var(--space-lg);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
	}

	.detail-card h3 {
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 1.125rem;
		margin-bottom: var(--space-lg);
		padding-bottom: var(--space-sm);
		border-bottom: 2px solid var(--color-gray-100);
	}

	/* Items List */
	.items-list {
		margin-bottom: var(--space-md);
	}

	.order-item {
		display: flex;
		gap: var(--space-sm);
		padding: var(--space-sm) 0;
		border-bottom: 1px solid var(--color-gray-100);
	}

	.order-item:last-child {
		border-bottom: none;
	}

	.item-qty {
		font-weight: 600;
		color: var(--color-secondary);
		min-width: 30px;
	}

	.item-name {
		flex: 1;
	}

	.item-price {
		font-weight: 500;
	}

	.order-total {
		display: flex;
		justify-content: space-between;
		padding-top: var(--space-md);
		border-top: 2px solid var(--color-gray-200);
		font-weight: 600;
	}

	/* Info Rows */
	.info-row {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin-bottom: var(--space-md);
	}

	.info-row:last-child {
		margin-bottom: 0;
	}

	.info-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		color: var(--color-gray-400);
		letter-spacing: 0.5px;
	}

	.info-value {
		font-weight: 500;
		color: var(--color-gray-800);
	}

	/* History */
	.history-card {
		grid-column: span 1;
	}

	.history-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.history-item {
		display: flex;
		gap: var(--space-md);
	}

	.history-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
		margin-top: 4px;
	}

	.history-content {
		flex: 1;
	}

	.history-header {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--space-sm);
		margin-bottom: var(--space-xs);
	}

	.history-status {
		font-weight: 600;
	}

	.history-time {
		font-size: 0.75rem;
		color: var(--color-gray-400);
	}

	.history-message {
		font-size: 0.875rem;
		color: var(--color-gray-600);
	}

	/* Help Section */
	.help-section {
		text-align: center;
		padding: var(--space-xl);
		background: var(--color-white);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
	}

	.help-section h3 {
		margin-bottom: var(--space-sm);
	}

	.help-section > p {
		margin-bottom: var(--space-lg);
	}

	.help-cards {
		display: flex;
		justify-content: center;
		gap: var(--space-lg);
		flex-wrap: wrap;
	}

	.help-card {
		padding: var(--space-lg);
		background: var(--color-light);
		border-radius: var(--radius-md);
		min-width: 180px;
	}

	.help-icon {
		display: block;
		font-size: 2rem;
		margin-bottom: var(--space-sm);
	}

	.help-card h4 {
		font-family: var(--font-body);
		font-weight: 600;
		margin-bottom: var(--space-xs);
	}

	.help-card p {
		font-size: 0.875rem;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.details-grid {
			grid-template-columns: 1fr;
		}

		.history-card {
			grid-column: span 1;
		}
	}

	@media (max-width: 600px) {
		.search-form {
			flex-direction: column;
			border-radius: var(--radius-lg);
		}

		.search-input-wrapper {
			border-radius: var(--radius-md);
		}

		.order-header {
			flex-direction: column;
		}
	}
</style>
