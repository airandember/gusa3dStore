<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth, isLoggedIn } from '$lib/auth';
	import { toasts } from '$lib/stores';
	import { onMount } from 'svelte';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	onMount(() => {
		// If already logged in, redirect to admin
		if ($isLoggedIn) {
			goto('/admin');
		}
	});

	// Redirect when logged in
	$: if ($isLoggedIn) {
		goto('/admin');
	}

	async function handleLogin() {
		if (!email || !password) {
			error = 'Please enter email and password';
			return;
		}

		loading = true;
		error = '';

		try {
			await auth.signIn(email, password);
			toasts.show('Welcome back! 🎉', 'success');
			goto('/admin');
		} catch (e: any) {
			console.error('Login error:', e);
			error = e.message || 'Invalid email or password';
			toasts.show('Login failed', 'error');
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Admin Login - GUSA3D 🔐</title>
</svelte:head>

<div class="login-page">
	<div class="login-container">
		<div class="login-card">
			<div class="login-header">
				<span class="login-icon">🔐</span>
				<h1>Admin Login</h1>
				<p>Sign in to manage GUSA3D</p>
			</div>

			<form on:submit|preventDefault={handleLogin} class="login-form">
				{#if error}
					<div class="error-message">
						<span>❌</span>
						{error}
					</div>
				{/if}

				<div class="form-group">
					<label for="email">Email</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						placeholder="admin@gusa3d.store"
						autocomplete="email"
						disabled={loading}
					/>
				</div>

				<div class="form-group">
					<label for="password">Password</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						placeholder="••••••••"
						autocomplete="current-password"
						disabled={loading}
					/>
				</div>

				<button type="submit" class="btn btn-primary btn-lg login-btn" disabled={loading}>
					{#if loading}
						🔄 Signing in...
					{:else}
						🚀 Sign In
					{/if}
				</button>
			</form>

			<div class="login-footer">
				<a href="/">← Back to Store</a>
			</div>
		</div>

		<div class="login-decoration">
			<span class="deco-emoji" style="top: 10%; left: 10%;">🖨️</span>
			<span class="deco-emoji" style="top: 20%; right: 15%;">🎨</span>
			<span class="deco-emoji" style="bottom: 30%; left: 20%;">🦖</span>
			<span class="deco-emoji" style="bottom: 20%; right: 10%;">🚀</span>
		</div>
	</div>
</div>

<style>
	.login-page {
		min-height: 80vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-xl);
	}

	.login-container {
		position: relative;
		width: 100%;
		max-width: 420px;
	}

	.login-card {
		background: var(--color-white);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
		padding: var(--space-2xl);
		position: relative;
		z-index: 1;
	}

	.login-header {
		text-align: center;
		margin-bottom: var(--space-xl);
	}

	.login-icon {
		display: block;
		font-size: 4rem;
		margin-bottom: var(--space-md);
		animation: float 3s ease-in-out infinite;
	}

	.login-header h1 {
		margin-bottom: var(--space-sm);
	}

	.login-header p {
		color: var(--color-gray-500);
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: rgba(255, 107, 107, 0.1);
		border-radius: var(--radius-md);
		color: var(--color-primary);
		font-weight: 500;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.form-group label {
		font-weight: 600;
		color: var(--color-gray-700);
	}

	.form-group input {
		padding: var(--space-md);
		border: 2px solid var(--color-gray-200);
		border-radius: var(--radius-md);
		font-size: 1rem;
		transition: var(--transition-fast);
	}

	.form-group input:focus {
		border-color: var(--color-secondary);
		outline: none;
		box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
	}

	.form-group input:disabled {
		background: var(--color-gray-100);
		cursor: not-allowed;
	}

	.login-btn {
		margin-top: var(--space-md);
		width: 100%;
	}

	.login-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.login-footer {
		text-align: center;
		margin-top: var(--space-xl);
		padding-top: var(--space-lg);
		border-top: 1px solid var(--color-gray-100);
	}

	.login-footer a {
		color: var(--color-gray-500);
		font-size: 0.875rem;
	}

	.login-footer a:hover {
		color: var(--color-primary);
	}

	/* Decorations */
	.login-decoration {
		position: absolute;
		inset: -40px;
		pointer-events: none;
		z-index: 0;
	}

	.deco-emoji {
		position: absolute;
		font-size: 2.5rem;
		opacity: 0.3;
		animation: float 4s ease-in-out infinite;
	}

	.deco-emoji:nth-child(2) { animation-delay: 0.5s; }
	.deco-emoji:nth-child(3) { animation-delay: 1s; }
	.deco-emoji:nth-child(4) { animation-delay: 1.5s; }

	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}
</style>
