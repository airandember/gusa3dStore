// API Configuration
// In development, we proxy through Vite to localhost:8080
// In production, set VITE_API_URL to your Render.com backend URL

export const API_URL = import.meta.env.VITE_API_URL || '';

// Example production URL (update this after deploying to Render):
// https://your-app-name.onrender.com
