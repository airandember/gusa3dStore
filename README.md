# 🖨️ GUSA3D

**www.gusa3d.store**

A fun, colorful e-commerce store run by kids aged 11-13 who sell 3D printed items!

## 🌟 Features

### For Customers:
- **Browse Products** - View all 3D prints with categories (Fantasy, Space, Dinosaurs, Gaming, etc.)
- **Shopping Cart** - Add items, update quantities, and checkout
- **Order Tracking** - Track your order status with a unique tracking code
- **Kid-to-Kid** - Products made by young makers for young buyers!

### For Admin (Kid Store Managers):
- **Dashboard** - View stats (total products, orders, revenue)
- **Product Management** - Add, edit, and delete products
- **Order Management** - Update order status with custom messages
- **Real-time Updates** - See pending orders that need attention

## 🚀 Local Development

### Prerequisites
- **Node.js** 18+ 

### 1. Start the Backend (Node.js/Express)

```bash
cd backend-node
npm install
npm start
```

The API will start at `http://localhost:8080`

### 2. Start the Frontend (Svelte)

```bash
cd frontend
npm install
npm run dev
```

The store will be available at `http://localhost:5173`

## ☁️ Deployment

### Backend → Render.com

1. Push your code to GitHub
2. Go to [Render.com](https://render.com) and create a new **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend-node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Deploy! Note your URL (e.g., `https://kids-3d-store-api.onrender.com`)

### Frontend → GitHub Pages

1. Update `frontend/.env` with your Render backend URL:
   ```
   VITE_API_URL=https://your-app-name.onrender.com
   ```

2. If deploying to `username.github.io/repo-name`, also set:
   ```
   BASE_PATH=/repo-name
   ```

3. Build the static site:
   ```bash
   cd frontend
   npm run build
   ```

4. Deploy the `build` folder to GitHub Pages:
   - Go to your repo Settings → Pages
   - Choose "Deploy from a branch" 
   - Select the branch containing your build folder
   - Or manually push the `build` folder contents to a `gh-pages` branch

**Quick deploy to gh-pages branch:**
```bash
cd frontend
npm run build
cd build
git init
git add .
git commit -m "Deploy"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -f origin main:gh-pages
```

## 📁 Project Structure

```
3DEEGusa/
├── backend-node/           # Node.js/Express API
│   ├── index.js           # Main server file
│   ├── package.json       # Dependencies
│   ├── render.yaml        # Render.com config
│   └── store.json         # Data file (auto-created)
│
├── frontend/              # SvelteKit application
│   ├── src/
│   │   ├── routes/        # Pages
│   │   │   ├── +page.svelte       # Home page
│   │   │   ├── +layout.svelte     # Main layout
│   │   │   ├── shop/              # Product catalog
│   │   │   ├── cart/              # Shopping cart & checkout
│   │   │   ├── track/             # Order tracking
│   │   │   └── admin/             # Admin dashboard
│   │   ├── lib/
│   │   │   ├── api.ts            # API client
│   │   │   ├── config.ts         # Configuration
│   │   │   └── stores.ts         # Svelte stores
│   │   ├── app.css               # Global styles
│   │   └── app.html              # HTML template
│   ├── static/                   # Static assets
│   └── package.json
│
└── README.md
```

## 🎨 API Endpoints

### Products
- `GET /api/products` - Get all products (optional: `?category=Fantasy`)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Cart (requires `X-Session-ID` header)
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update quantity
- `DELETE /api/cart/:id` - Remove item
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order (from cart)
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/track/:code` - Track by tracking code

### Admin
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id` - Update order status
- `GET /api/admin/stats` - Get dashboard stats

## 🎭 Demo Products

The backend automatically seeds 12 sample products when first started:
- 🐉 Cute Dragon (Fantasy)
- 🚀 Rocket Ship (Space)
- 📱 Phone Stand (Useful)
- 🦖 Dino T-Rex (Dinosaurs)
- 🎮 Minecraft Creeper (Gaming)
- 🌀 Fidget Spinner (Fidgets)
- 🦄 Unicorn (Fantasy)
- 🐍 Articulated Snake (Animals)
- ✏️ Pencil Holder (Useful)
- 👽 Baby Yoda (Movies)
- 🐙 Flexi Octopus (Animals)
- 🔑 Keychain Set (Accessories)

## 🎉 Technology Stack

- **Backend**: Node.js + Express (hosted on Render.com)
- **Frontend**: SvelteKit with static adapter (hosted on GitHub Pages)
- **Styling**: Custom CSS with CSS variables for theming
- **Font**: Fredoka (body) + Rubik Bubbles (display)

## 💡 Tips for Kids

1. **Adding Products**: Go to Admin → Products → Add Product
2. **Updating Orders**: Go to Admin → Orders → Click "Update Status"
3. **Tracking Orders**: Share the tracking code with customers!

---

Made with ❤️ for young entrepreneurs! 🌟
