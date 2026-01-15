# MotruBi - Premium Motorcycle E-Commerce Platform

A modern, full-stack e-commerce application built with Next.js 16, featuring a comprehensive motorcycle shopping experience, cart management, checkout system, and user dashboards.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black) ![React](https://img.shields.io/badge/React-19.2.3-blue) ![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8) ![Express](https://img.shields.io/badge/Express-4.18-green) ![Stripe](https://img.shields.io/badge/Stripe-Payment-blueviolet)

## 🎯 Project Description

MotruBi is a feature-rich motorcycle e-commerce platform that provides a complete online shopping experience. Users can browse motorcycles, add them to cart, proceed through checkout with multiple payment options (Stripe or Cash on Delivery), track orders, manage wishlists, and request custom quotes. The platform includes role-based dashboards for different user types (customers, dealers, merchandisers, and admins), authentication, and a stunning landing page with promotional content.

## ✨ Implemented Features

### 🌐 Public Features
- **Landing Page** - Stunning homepage with 8 comprehensive sections:
  - Hero section with animated gradients and CTAs
  - Promotional slider with featured bikes
  - Features showcase
  - Services overview
  - Statistics and achievements
  - How it works guide
  - Customer testimonials with ratings
  - Call-to-action section

- **Bike Browsing** - Comprehensive motorcycle catalog:
  - Search by name or description
  - Filter by category (Sport, Cruiser, Adventure, etc.)
  - Toggle featured bikes
  - Responsive grid layout
  - Loading and error states

- **Bike Details** - In-depth motorcycle information:
  - High-quality image galleries
  - Full specifications (engine, power, top speed, weight)
  - Available colors
  - Feature list with icons
  - Customer reviews and ratings
  - Stock availability
  - Add to cart and wishlist buttons

### 🔐 Authentication System
- **NextAuth.js Integration** - Secure authentication:
  - Email/password credentials provider
  - Demo credentials: `demo@example.com` / `password123`
  - JWT-based session management
  - Protected routes with middleware
  - Persistent sessions across page reloads
  - Signup with email verification

### 🛒 Shopping Features (Authenticated Users)
- **Shopping Cart** - Full cart management:
  - Add motorcycles to cart
  - Update quantities
  - Remove items
  - View cart total
  - Persistent cart storage per user
  - Cart count badge in navbar

- **Checkout System** - Two-step checkout process:
  - **Step 1: Shipping Information** - Collect delivery address
  - **Step 2: Payment Method** - Choose between Stripe or Cash on Delivery
  - Stripe integration for credit/debit card payments
  - Cash on Delivery (COD) option
  - Promotional code system with discounts
  - Real-time price calculation (subtotal, tax, shipping, discounts)
  - Order summary sidebar
  - Secure payment processing

- **Wishlist** - Save favorite motorcycles:
  - Add/remove bikes from wishlist
  - View all wishlist items
  - Quick add to cart from wishlist
  - Persistent storage

- **Order Management**:
  - Order confirmation page with details
  - Order tracking with unique order numbers
  - View order history
  - Order status updates
  - Detailed order information (items, shipping, payment)

- **Quote Requests**:
  - Request custom quotes for bulk purchases
  - View quote details
  - Quote status tracking
  - Direct communication with dealers

### 👤 User Dashboard (Role-Based)
- **Customer Dashboard**:
  - Recent orders overview
  - Quick stats (total orders, pending, delivered)
  - Wishlist summary
  - Profile management

- **Dealer Dashboard**:
  - Inventory management
  - Quote requests from customers
  - Order fulfillment tracking
  - Sales analytics

- **Merchandiser Dashboard**:
  - Product catalog management
  - Promotional campaigns
  - Featured bikes management

- **Admin Dashboard**:
  - User management
  - System analytics
  - Order oversight
  - Platform configuration

### 📱 Additional Features
- **Add New Bike** (Admin/Merchandiser):
  - Comprehensive form with validation
  - Upload images, specs, features, and pricing
  - Category management
  - Stock control

- **Profile Management**:
  - Update personal information
  - Change password
  - View order history
  - Manage shipping addresses

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16.1.1 (App Router)
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Authentication**: NextAuth.js 4.24.5
- **Payments**: Stripe React SDK (@stripe/react-stripe-js, @stripe/stripe-js)
- **State Management**: React Context API (CartContext)
- **Notifications**: React Hot Toast
- **Utilities**: clsx, tailwind-merge, class-variance-authority

### Backend
- **Server**: Express.js 4.18
- **Storage**: JSON file-based database (bikes, users, orders, cart)
- **Middleware**: CORS, Body-parser
- **API**: RESTful endpoints
- **Payment Processing**: Stripe API integration

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Compiler**: Babel React Compiler

## 📁 Project Structure

```
MotruBi/
├── express-api/              # Backend Express server
│   ├── server.js            # Main server file
│   ├── data.json            # Bike inventory database
│   ├── users.json           # User data
│   ├── orders.json          # Order records
│   ├── cart.json            # Shopping cart data
│   └── package.json         # Backend dependencies
│
└── nextjs-project/          # Frontend Next.js application
    ├── src/
    │   ├── app/             # App Router pages
    │   │   ├── layout.js    # Root layout with providers
    │   │   ├── page.js      # Landing page
    │   │   ├── login/       # Login page
    │   │   ├── signup/      # Signup page
    │   │   ├── bikes/       # Bikes listing and detail pages
    │   │   ├── cart/        # Shopping cart page
    │   │   ├── checkout/    # Checkout flow
    │   │   ├── wishlist/    # Wishlist page
    │   │   ├── dashboard/   # User dashboards
    │   │   ├── profile/     # User profile
    │   │   ├── my-orders/   # Order history
    │   │   ├── quotes/      # Quote requests
    │   │   ├── order-confirmation/  # Order success page
    │   │   ├── add-bike/    # Add bike form (protected)
    │   │   └── api/auth/    # NextAuth API routes
    │   │
    │   ├── components/      # React components
    │   │   ├── ui/          # shadcn/ui components (button, card, input, etc.)
    │   │   ├── landing/     # Landing page sections
    │   │   ├── checkout/    # Checkout components (Stripe, forms)
    │   │   ├── dashboard/   # Dashboard components by role
    │   │   ├── Navbar.jsx   # Navigation with cart badge
    │   │   ├── Footer.jsx   # Footer component
    │   │   └── BikeCard.jsx # Bike card component
    │   │
    │   ├── contexts/        # React Context providers
    │   │   └── CartContext.jsx  # Shopping cart state management
    │   │
    │   └── lib/             # Utility functions
    │       ├── auth.js      # NextAuth configuration
    │       ├── api.js       # API client functions
    │       └── utils.js     # Helper utilities
    │
    ├── .env.local           # Environment variables
    ├── middleware.js        # Route protection
    ├── tailwind.config.ts   # Tailwind configuration
    └── package.json         # Frontend dependencies
```

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** 18+ and npm installed
- **Git** (optional, for cloning)
- **Stripe Account** (optional, for live payments - test mode works without)

### Step 1: Clone or Download the Repository
```bash
git clone <repository-url>
cd NextJsSCIC
```

### Step 2: Setup Express Backend API
Navigate to the Express API directory and install dependencies:
```bash
cd express-api
npm install
```

Start the backend server in development mode:
```bash
npm run dev
```
✅ The API server will start on **http://localhost:5000**

### Step 3: Setup Next.js Frontend (New Terminal Window)
Open a new terminal window, navigate to the Next.js project, and install dependencies:
```bash
cd nextjs-project
npm install
```

Start the frontend development server:
```bash
npm run dev
```
✅ The Next.js app will start on **http://localhost:3000**

### Step 4: Configure Environment Variables
The `.env.local` file should be created in the `nextjs-project` directory with the following values:

```env
# App URL
NEXTAUTH_URL=http://localhost:3000

# NextAuth Secret (generate using: openssl rand -base64 32)
NEXTAUTH_SECRET=your-super-secret-nextauth-secret-key-change-in-production

# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Stripe Keys (Optional - uses test mode by default)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

**Note**: For production deployment, generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### Step 5: Access the Application
Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🗺️ Routes Summary

### Public Routes (No Authentication Required)
| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, promo slider, testimonials, and CTA |
| `/bikes` | Browse all motorcycles with search and filters |
| `/bikes/[id]` | View individual bike details with reviews |
| `/login` | User authentication page |
| `/signup` | New user registration |

### Protected Routes (Authentication Required)
| Route | Description |
|-------|-------------|
| `/cart` | Shopping cart with quantity management |
| `/checkout` | Two-step checkout (shipping + payment) |
| `/wishlist` | Saved motorcycles wishlist |
| `/dashboard` | Role-based dashboard (customer/dealer/merchandiser/admin) |
| `/profile` | User profile management |
| `/my-orders` | Order history and tracking |
| `/my-orders/[orderNumber]` | Individual order details |
| `/order-confirmation/[orderNumber]` | Order success confirmation page |
| `/quotes/[quoteId]` | Custom quote request details |
| `/add-bike` | Add new motorcycle to inventory (admin/merchandiser) |

### API Endpoints (Express Server - http://localhost:5000)

#### Bike Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bikes` | Get all bikes (supports filtering: category, featured, price, search) |
| GET | `/api/bikes/:id` | Get single bike by ID |
| POST | `/api/bikes` | Create new bike (requires auth) |
| PUT | `/api/bikes/:id` | Update bike |
| DELETE | `/api/bikes/:id` | Delete bike |

#### Shopping Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user's cart items |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/update/:bikeId` | Update item quantity |
| DELETE | `/api/cart/remove/:bikeId` | Remove item from cart |
| DELETE | `/api/cart/clear` | Clear entire cart |

#### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders/create` | Create new order |
| GET | `/api/orders` | Get user's order history |
| GET | `/api/orders/:orderNumber` | Get specific order details |

#### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/create-payment-intent` | Initialize Stripe payment |
| POST | `/api/promos/validate` | Validate promotional code |

#### Wishlist & Quotes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wishlist` | Get user's wishlist |
| POST | `/api/wishlist/add` | Add bike to wishlist |
| DELETE | `/api/wishlist/remove/:bikeId` | Remove from wishlist |
| POST | `/api/quotes/request` | Request custom quote |



## 🔑 Authentication

### Demo Credentials
- **Email**: `demo@example.com`
- **Password**: `password123`

### How Authentication Works
1. User navigates to `/login` or clicks "Login" in navbar
2. Enter email and password credentials
3. NextAuth validates against user database
4. JWT token is generated and stored in secure HTTP-only cookie
5. Session persists across page reloads
6. Protected routes check session via middleware
7. Unauthenticated users are redirected to `/login`
8. Logout clears session and redirects to homepage

## 🔧 Development Workflow

### Running in Development Mode
You need **two terminal windows** running simultaneously:

```bash
# Terminal 1 - Express API Backend
cd express-api
npm run dev

# Terminal 2 - Next.js Frontend
cd nextjs-project
npm run dev
```

### Building for Production
```bash
# Build Next.js app
cd nextjs-project
npm run build
npm start

# Run Express API in production mode
cd express-api
npm start
```

### Linting & Code Quality
```bash
cd nextjs-project
npm run lint
```

## 📊 API Filtering

**GET /api/bikes** supports: `category`, `featured`, `minPrice`, `maxPrice`, `search`

Example: `GET /api/bikes?category=Sport&featured=true&minPrice=10000`

## 🐛 Troubleshooting


## 🌟 Future Enhancements

- Google OAuth • Real database (MongoDB/PostgreSQL) • Email notifications
- Bike comparison tool • Advanced filtering • Image uploads • Real-time chat
- Reviews system • Inventory tracking • Admin analytics • Multi-currency & i18n

## 📄 License

This project is for educational and demonstration purposes.

## 👨‍💻 Author

Built as a comprehensive demonstration of:
- Next.js 16 App Router architecture
- Express.js RESTful API design
- NextAuth.js authentication patterns
- Stripe payment integration
- React Context API for state management
- Modern UI/UX with Tailwind CSS 4
- Full-stack e-commerce workflows

---

**Made with ❤️ using Next.js 16, React 19, Tailwind CSS 4, Express.js, and Stripe**
