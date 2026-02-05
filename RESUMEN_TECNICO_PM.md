# MyDigitable v2 - Technical Specification Document
## For Project Manager Onboarding

---

## 1. PROJECT OVERVIEW

**MyDigitable** is a SaaS platform for restaurants, beach clubs, and hospitality businesses. It provides digital menus, QR ordering, payment processing, and business management tools.

### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | TailwindCSS, Framer Motion |
| State | Zustand (client), React Server Components |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| Payments | Stripe Connect |
| Hosting | Vercel |

---

## 2. DATABASE SCHEMA (Supabase PostgreSQL)

### Core Tables

```sql
-- RESTAURANTS (main entity)
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_url TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'ES',
    
    -- Subscription
    subscription_plan TEXT CHECK (subscription_plan IN ('basic', 'pro', 'enterprise')) DEFAULT 'basic',
    
    -- Stripe
    stripe_account_id TEXT,
    stripe_account_status TEXT DEFAULT 'pending',
    
    -- Operation Modes
    mode_restaurant BOOLEAN DEFAULT true,
    mode_beach BOOLEAN DEFAULT false,
    mode_pool BOOLEAN DEFAULT false,
    
    -- Capabilities
    accepts_orders BOOLEAN DEFAULT true,
    accepts_reservations BOOLEAN DEFAULT false,
    accepts_waiter_calls BOOLEAN DEFAULT false,
    
    -- Theme
    theme_id TEXT DEFAULT 'classic',
    primary_color TEXT DEFAULT '#22C55E',
    
    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 1,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- CATEGORIES
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name_es TEXT NOT NULL,
    name_en TEXT,
    description_es TEXT,
    icon TEXT DEFAULT '🍽️',
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- PRODUCTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name_es TEXT NOT NULL,
    name_en TEXT,
    description_es TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    allergens TEXT[],
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false
);

-- ORDERS
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id),
    order_number TEXT NOT NULL,
    table_number TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    order_type TEXT CHECK (order_type IN ('dine_in', 'takeaway', 'delivery', 'beach', 'pool')),
    status TEXT DEFAULT 'pending',
    items JSONB NOT NULL,
    subtotal DECIMAL(10,2),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    payment_method TEXT,
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLES
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id),
    table_number TEXT NOT NULL,
    capacity INTEGER DEFAULT 4,
    zone TEXT,
    status TEXT DEFAULT 'available',
    qr_code TEXT,
    is_active BOOLEAN DEFAULT true
);

-- RESERVATIONS
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    party_size INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    special_requests TEXT
);

-- WAITER_CALLS
CREATE TABLE waiter_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id),
    table_number TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- DAILY_METRICS (Analytics)
CREATE TABLE daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id),
    date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    average_order_value DECIMAL(10,2),
    UNIQUE(restaurant_id, date)
);
```

---

## 3. BUSINESS LOGIC

### 3.1 Cart & Orders Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Customer   │───▶│  Add to     │───▶│  Checkout   │───▶│  Order      │
│  scans QR   │    │  Cart       │    │  + Pay      │    │  Created    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                         │                   │                   │
                   Zustand Store      Stripe Intent       Supabase Insert
                   (localStorage)     (if online pay)     + Realtime
```

**Cart Store** (`src/lib/store/cartStore.ts`):
- Zustand with localStorage persistence
- Tracks: restaurant, table, items, totals, promotions
- Auto-clears when switching restaurants
- Supports modifiers (extras, sizes, etc.)

**Order Types**:
| Type | Description |
|------|-------------|
| `dine_in` | Restaurant table service |
| `takeaway` | Customer picks up |
| `delivery` | Delivery to address |
| `beach` | Beach sunbed service (GPS) |
| `pool` | Pool lounger service |

### 3.2 Payment Processing

1. **Cash** - Order marked as `pending` payment
2. **Card at Table** - Waiter processes with terminal
3. **Online** - Stripe Payment Intent flow:
   - Create PaymentIntent on server
   - Customer completes payment
   - Webhook confirms → order status updates

### 3.3 Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| **Starter** | €0/mo | Digital menu, QR codes, basic orders |
| **Basic** | €40/mo | 0% platform fee, multi-language, analytics |
| **Pro** | €90/mo | Beach GPS, AI import, 24/7 support, API |

---

## 4. KEY DIFFERENTIATORS (Already Implemented)

| Feature | Status | Description |
|---------|--------|-------------|
| 🏖️ Beach Mode GPS | ✅ Ready | Locate customer by GPS coordinates |
| 🌍 7-Language Support | ✅ Ready | ES, EN, PT, IT, FR, DE, EL |
| 🎨 Theme System | ✅ Ready | 5 themes: classic, dark, ocean, minimal, sunset |
| 📱 Waiter Call | ✅ Ready | Real-time alerts to staff |
| 🍽️ Daily Menu | ✅ Ready | Multi-course menu with selections |
| 🥗 Dietary Filters | ✅ Ready | Vegetarian, vegan, gluten-free, allergens |
| 📊 Analytics | ✅ Ready | Revenue, orders, popular items |
| 🎁 Promotions | ✅ Ready | Codes, percentage/fixed discounts |

---

## 5. FILE STRUCTURE

### Routes (`src/app/`)

| Path | Purpose |
|------|---------|
| `/` | Landing page with pricing |
| `/register` | User registration + plan selection |
| `/login` | User authentication |
| `/onboarding` | 10-step setup wizard |
| `/dashboard` | Restaurant admin panel |
| `/dashboard/menu` | Menu management (CRUD) |
| `/dashboard/orders` | Order management |
| `/dashboard/tables` | Table/zone management |
| `/dashboard/analytics` | Business metrics |
| `/dashboard/settings` | Restaurant configuration |
| `/r/[slug]` | **Public menu** (customer-facing) |

### Key Components

| File | Purpose |
|------|---------|
| `src/lib/store/cartStore.ts` | Zustand cart state (290 lines) |
| `src/lib/store/restaurantStore.ts` | Dashboard data store (500+ lines) |
| `src/types/database.ts` | All TypeScript types (571 lines) |
| `src/app/r/[slug]/page.tsx` | Public menu (1307 lines) |
| `src/app/dashboard/layout.tsx` | Dashboard shell + navigation |
| `src/app/onboarding/page.tsx` | 10-step onboarding wizard |

### Onboarding Steps

| Step | Component | Purpose |
|------|-----------|---------|
| 1 | Welcome | Intro animation |
| 2 | Contact | Phone, social media |
| 3 | Address | Location setup |
| 4 | Schedule | Operating hours |
| 5 | Modes | Restaurant/Beach/Pool toggle |
| 6 | Capabilities | Orders, reservations, waiter calls |
| 7 | Tables | Table/zone configuration |
| 8 | Menu | Import or create menu |
| 9 | Theme | Visual customization |
| 10 | Review | Final summary + launch |

---

## 6. ENVIRONMENT VARIABLES

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_SITE_URL=https://mydigitable.com
```

---

## 7. CURRENT STATUS

| Module | Status | Notes |
|--------|--------|-------|
| Authentication | ✅ 100% | Login, register, password reset |
| Onboarding | ✅ 100% | 10 steps functional |
| Dashboard Shell | ✅ 100% | Navigation, layout, responsive |
| Menu CRUD | ✅ 95% | Categories, products, modifiers |
| Orders | ✅ 90% | List, status updates, realtime |
| Tables | ✅ 85% | CRUD, QR generation |
| Analytics | ✅ 80% | Charts, metrics |
| Public Menu | ✅ 95% | Cart, checkout, dietary filters |
| Payments | 🔄 70% | Stripe integration in progress |
| Beach GPS | 🔄 60% | UI ready, GPS implementation pending |

---

## 8. NEXT STEPS (SPRINT PRIORITIES)

1. **Complete Stripe Connect** - Onboarding flow for restaurant accounts
2. **Beach GPS Feature** - Full implementation with geolocation
3. **AI Menu Import** - Photo-to-menu OCR integration
4. **Email Notifications** - Order confirmations, reservations
5. **Mobile App** - React Native wrapper

---

*Document generated: 2026-02-05*
*Version: MyDigitable v2.0 - Pre-Launch*
