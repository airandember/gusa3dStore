# 🖨️ GUSA3D - Kids 3D Print Shop

A colorful, fun online store for kids (ages 11-13) to sell their 3D prints! Built by kids, for kids.

**Live Site:** [www.gusa3d.store](https://www.gusa3d.store)

## 🚀 Architecture

**100% Serverless - Zero Monthly Cost!**

- **Frontend:** SvelteKit static site on GitHub Pages (FREE)
- **Database:** Supabase PostgreSQL (FREE - 500MB)
- **Auth:** Supabase Auth (FREE - 50,000 MAU)
- **No backend server needed!** 🎉

## 📁 Project Structure

```
gusa3d/
├── frontend/           # SvelteKit frontend
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api.ts       # Direct Supabase API calls
│   │   │   ├── auth.ts      # Auth store & functions
│   │   │   ├── supabase.ts  # Supabase client
│   │   │   └── stores.ts    # Svelte stores
│   │   └── routes/          # Pages
│   └── build/              # Production build
└── backend-node/       # (Legacy - not needed!)
```

## 🛠️ Setup

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a project
2. Run the schema SQL in SQL Editor (from `backend-node/schema.sql`)
3. Run security policies (from `frontend/supabase-security.sql`)
4. Create an admin user in Authentication → Users → Add user

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development

```bash
npm run dev
```

Open http://localhost:5173 🎉

## 🚀 Deployment

### Build & Deploy to GitHub Pages

```bash
cd frontend
npm run build
cd build
git init
git add .
git commit -m "Deploy"
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -f origin main:gh-pages
```

### GitHub Pages Settings

1. Go to Repository → Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** / **(root)**
4. Custom domain: `www.gusa3d.store` (if using custom domain)

### DNS Setup (for custom domain)

Add these records to your domain:
- **CNAME:** `www` → `airandember.github.io`
- **A Records:** (for apex domain)
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`

## ✨ Features

- 🛒 **Shopping Cart** - Add/remove items, persisted per session
- 🔍 **Product Categories** - Filter by Fantasy, Toys, Desk Stuff, etc.
- 📦 **Order Tracking** - Track orders with fun status updates
- 🎉 **Confetti & Fireworks** - Celebration when adding to cart!
- 🔐 **Admin Dashboard** - Secure login to manage products & orders
- 📱 **Mobile Responsive** - Works great on all devices

## 🔐 Admin Access

1. Navigate to `/admin/login`
2. Sign in with your Supabase admin credentials
3. Manage products and orders!

## 🎨 Tech Stack

- **Frontend:** SvelteKit + TypeScript
- **Styling:** Custom CSS with CSS Variables
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Hosting:** GitHub Pages
- **Animations:** canvas-confetti

## 💰 Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| GitHub Pages | FREE | Static hosting |
| Supabase DB | FREE | 500MB database |
| Supabase Auth | FREE | 50K monthly users |
| Custom Domain | ~$10/yr | Optional |
| **Total** | **$0/mo** | 🎉 |

## 📝 License

MIT - Built with ❤️ by GUSA3D team
