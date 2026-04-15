# ⚡ PrimeGadgets — Dubai's Premier MERN Ecommerce Platform

A production-ready, premium full-stack MERN ecommerce application built for the Dubai tech market. Features a luxury dark/light design system, animated UI, and full admin panel.

---

## 🖼️ Design Highlights
- **Luxury-Tech UI**: Clash Display + Satoshi typography, smooth Framer Motion animations
- **Light/Dark Mode**: Ultra-smooth system with CSS variables, persists across sessions
- **Search Modal**: Animated popup with live suggestions (inspired by galaxysolution.tech)
- **Mega-dropdown Nav**: Category grid with hover animations
- **Conversion Psychology**: Scarcity badges, trust signals, urgency timers
- **Mobile-first**: Fully responsive with slide-in mobile menu

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 18 + Vite, Framer Motion, Zustand, Swiper |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose |
| **Auth** | JWT + bcrypt, persistent Zustand store |
| **Payments** | Stripe (card), COD, Apple Pay, Google Pay |
| **Images** | Cloudinary CDN |
| **Email** | Nodemailer (Gmail SMTP) |
| **Charts** | Recharts (admin dashboard) |
| **Security** | Helmet, rate limiting, mongo-sanitize, CORS |

---

## 📁 Project Structure

```
primegadgets/
├── backend/
│   ├── config/          # DB + Cloudinary
│   ├── controllers/     # auth, products, orders, reviews, stats, payments
│   ├── middleware/       # auth, errorHandler
│   ├── models/          # User, Product, Order, Review
│   ├── routes/          # All API routes (8 files)
│   ├── utils/           # APIFeatures
│   ├── seeder.js        # 10 Dubai gadget products + admin user
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── layout/    # Navbar (mega-dropdown, mobile), Footer
        │   ├── product/   # ProductCard
        │   ├── cart/      # CartDrawer (slide-in)
        │   └── ui/        # SearchModal, uiStore
        ├── pages/
        │   ├── Home.jsx           # Hero carousel, featured, deals
        │   ├── Products.jsx       # Filter/sort/paginate
        │   ├── ProductDetail.jsx  # Gallery, specs, reviews
        │   ├── Cart.jsx
        │   ├── Checkout.jsx       # Multi-step (ship → pay → review)
        │   ├── OrderSuccess.jsx
        │   ├── Orders.jsx
        │   ├── OrderDetail.jsx    # Tracker
        │   ├── Profile.jsx
        │   ├── Wishlist.jsx
        │   ├── About.jsx
        │   ├── Contact.jsx        # Dubai map embed + WhatsApp CTA
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── admin/
        │       ├── Dashboard.jsx  # Charts, stats, top products
        │       ├── Products.jsx   # CRUD table
        │       ├── ProductForm.jsx
        │       ├── Orders.jsx
        │       └── Users.jsx
        ├── store/
        │   └── index.js   # Zustand: auth, cart, theme
        ├── styles/
        │   └── globals.css  # Full design system (tokens, components)
        └── utils/
            └── api.js     # Axios instance + interceptors
```

---

## 🚀 Quick Setup

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- (Optional) Cloudinary, Stripe, Gmail SMTP accounts

### 1. Install
```bash
git clone <repo>
cd primegadgets
npm install
npm run install-all
```

### 2. Configure
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

Minimum required to run locally (without cloud services):
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/primegadgets
JWT_SECRET=any_long_random_string_here
```

### 3. Seed Database
```bash
npm run seed
```
Creates:
- **Admin**: `admin@primegadgets.ae` / `admin@PG2024`
- **User**: `ahmed@example.com` / `password123`
- **10 products**: DJI Mavic 3, AirPods Pro, Galaxy Watch Ultra, Meta Quest 3, Sony XM5, GoPro HERO12, Apple Vision Pro, DJI Osmo Pocket, Samsung Odyssey, Razer DeathAdder

### 4. Run Development
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1

---

## 🌐 API Reference

### Auth (`/api/v1/auth`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | — | Register user |
| POST | `/login` | — | Login |
| GET | `/me` | ✅ | Get profile |
| PUT | `/updateprofile` | ✅ | Update name/phone |
| PUT | `/updatepassword` | ✅ | Change password |
| PUT | `/wishlist/:id` | ✅ | Toggle wishlist |
| POST | `/forgotpassword` | — | Send reset link |
| PUT | `/resetpassword/:token` | — | Reset password |

### Products (`/api/v1/products`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | — | All products (filter/sort/paginate) |
| GET | `/featured` | — | Featured products |
| GET | `/deals` | — | Deal products |
| GET | `/new-arrivals` | — | New arrivals |
| GET | `/best-sellers` | — | Best sellers |
| GET | `/search/suggestions?q=` | — | Live search suggestions | 
| GET | `/categories` | — | Category list with counts |
| GET | `/:id` | — | Single product (by ID or slug) |
| GET | `/:id/related` | — | Related products |
| POST | `/` | Admin | Create product |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Soft-delete product |

### Orders (`/api/v1/orders`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/` | ✅ | Place order |
| GET | `/my` | ✅ | My orders |
| GET | `/:id` | ✅ | Order detail |
| PUT | `/:id/cancel` | ✅ | Cancel order |
| GET | `/` | Admin | All orders |
| PUT | `/:id/status` | Admin | Update status |

### Reviews (`/api/v1/reviews`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/product/:productId` | — | Product reviews |
| POST | `/product/:productId` | ✅ | Create review |
| DELETE | `/:id` | ✅ | Delete review |
| PUT | `/:id/helpful` | ✅ | Mark helpful |

---

## ✨ Features

### Customer Experience
- 🏠 **Homepage**: Animated hero, featured products, deals section, category grid, trust badges
- 🔍 **Smart Search**: Animated modal with live suggestions, trending searches, recent history
- 🛍️ **Product Pages**: Image gallery, specs tabs, star ratings, verified reviews
- 🛒 **Cart**: Slide-in drawer, quantity controls, free shipping progress
- 💳 **Checkout**: 3-step flow (Shipping → Payment → Review), multiple payment methods
- 📦 **Order Tracking**: Visual status tracker, timeline, cancellation
- ❤️ **Wishlist**: Save favourite products
- 🌙 **Dark/Light Mode**: Smooth transition, persisted preference

### Admin Panel
- 📊 **Dashboard**: Revenue charts, order stats, top products
- 📦 **Product CRUD**: Full create/edit with image upload, specs, variants
- 🛒 **Order Management**: Status updates, filtering, customer details
- 👥 **User Management**: Role changes, account activation/deactivation

### Technical
- ⚡ **Vite** for instant HMR and fast builds
- 🔒 **JWT Auth** with Zustand persistent store
- 🛡️ **Security**: Helmet, rate limiting, mongo sanitize, input validation
- 📱 **Fully Responsive**: Mobile, tablet, desktop
- 🎭 **Framer Motion**: Page transitions, card animations, micro-interactions
- 🔎 **SEO**: React Helmet Async, meta tags, semantic HTML

---

## 🔧 Environment Variables (Full)

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/primegadgets
JWT_SECRET=your_jwt_secret_minimum_32_chars
JWT_EXPIRE=30d

# Stripe (optional - for card payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloudinary (optional - for image uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email (optional - for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@primegadgets.ae
FROM_NAME=PrimeGadgets
```

---

## 📄 License
MIT © PrimeGadgets Dubai 2024
