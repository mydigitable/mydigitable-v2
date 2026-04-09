# 🏗️ MYDIGITABLE v2 - ARCHITECTURE BIBLE

**La única fuente de verdad del proyecto**

---

## 📚 TABLE OF CONTENTS

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Database Schema](#database-schema)
4. [Theme System](#theme-system)
5. [Authentication & Authorization](#authentication--authorization)
6. [Server Actions](#server-actions)
7. [Deployment Guide](#deployment-guide)
8. [Development Workflow](#development-workflow)
9. [Code Conventions](#code-conventions)
10. [Performance Optimizations](#performance-optimizations)

---

## 🚀 TECH STACK

### **Frontend**

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.35 | React framework with App Router |
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.7.2 | Type safety |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS |
| **Shadcn/ui** | Latest | Accessible component library |
| **Framer Motion** | Latest | Animations |
| **Lucide React** | 0.468.0 | Icon library |
| **React Hook Form** | Latest | Form management |
| **Zod** | 3.24.1 | Schema validation |
| **Sonner** | 1.7.1 | Toast notifications |

### **Backend & Infrastructure**

| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL database + Auth + Storage + Realtime |
| **Supabase Auth** | User authentication & session management |
| **Supabase Storage** | Image uploads (product images, logos) |
| **PostgreSQL** | Relational database (25 tables) |
| **Row Level Security (RLS)** | Multi-tenant data isolation |
| **Next.js Server Actions** | Type-safe API layer |

### **Development Tools**

- **ESLint** - Code linting
- **Prettier** - Code formatting (via Tailwind plugin)
- **Git** - Version control
- **Vercel** - Deployment platform (recommended)

---

## 📁 PROJECT STRUCTURE

```
mydigitable-v2/
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── (dashboard)/              # Dashboard layout group
│   │   │   └── dashboard/            # Dashboard routes
│   │   │       ├── menu/             # Menu management
│   │   │       ├── settings/         # Restaurant settings
│   │   │       ├── staff/            # Staff management
│   │   │       ├── qr/               # QR code generator
│   │   │       └── page.tsx          # Dashboard home
│   │   ├── (public)/                 # Public layout group
│   │   │   └── r/[slug]/             # Public menu pages
│   │   ├── actions/                  # Shared server actions
│   │   ├── auth/                     # Auth callbacks
│   │   ├── login/                    # Login page
│   │   ├── register/                 # Registration flow
│   │   ├── onboarding/               # Post-registration onboarding
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles + theme CSS variables
│   │
│   ├── components/
│   │   ├── dashboard/                # Dashboard-specific components
│   │   │   ├── Sidebar.tsx           # Main navigation
│   │   │   ├── MenuPreview.tsx       # Menu preview component
│   │   │   ├── ImageUploader.tsx     # Supabase Storage uploader
│   │   │   └── ...
│   │   ├── menu-dashboard/           # Menu management UI
│   │   │   ├── MenuDashboard.tsx     # Main menu dashboard
│   │   │   ├── MenuSidebar.tsx       # Menu list sidebar
│   │   │   ├── MenuMainArea.tsx      # Categories/Products tabs
│   │   │   ├── MenuInspector.tsx     # Theme selector + preview
│   │   │   ├── ProductPanel.tsx      # Product creation/edit panel
│   │   │   ├── ProductsTab.tsx       # Products list
│   │   │   └── ThemeItem.tsx         # Theme selector item
│   │   ├── onboarding/               # Onboarding flow components
│   │   ├── theme/                    # Theme-related components
│   │   └── ui/                       # Reusable UI components (Shadcn)
│   │
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts             # Browser Supabase client
│       │   └── server.ts             # Server Supabase client
│       ├── theme/
│       │   ├── themes.ts             # 5 theme definitions
│       │   ├── types.ts              # Theme TypeScript interfaces
│       │   └── apply-theme.ts        # Theme application logic
│       ├── validations/
│       │   ├── product.ts            # Product Zod schema
│       │   └── ...
│       └── utils.ts                  # Helper functions
│
├── public/                           # Static assets
│   └── images/                       # Public images
│
├── supabase/                         # Database migrations (optional)
│
├── schema.sql                        # Complete database schema
├── README.md                         # Project overview
├── ARCHITECTURE.md                   # This file (Architecture Bible)
├── package.json                      # Dependencies
├── next.config.mjs                   # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
└── .env.local                        # Environment variables (not in git)
```

### **Key Directories Explained**

#### **`src/app/`**
- Uses Next.js 14 App Router
- Route groups: `(dashboard)` and `(public)` for different layouts
- Server Components by default
- `page.tsx` = route, `layout.tsx` = shared layout

#### **`src/components/menu-dashboard/`**
- Complete menu management system
- Drag & drop functionality
- Real-time preview
- Theme selector integration

#### **`src/lib/`**
- Shared utilities and configurations
- Supabase clients (browser vs server)
- Theme system (5 professional themes)
- Validation schemas (Zod)

---

## 🗄️ DATABASE SCHEMA

### **Overview**

- **Total Tables**: 25
- **Database**: PostgreSQL (via Supabase)
- **Multi-Tenancy**: Isolated by `restaurant_id`
- **Security**: Row Level Security (RLS) policies
- **Primary Keys**: UUIDs for distributed systems

### **Core Tables**

#### **1. restaurants**
```sql
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    business_type TEXT NOT NULL, -- 'restaurant', 'cafe', 'bar', 'food_truck'
    plan_tier TEXT NOT NULL DEFAULT 'basic', -- 'basic', 'pro', 'enterprise'
    active_addons TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_active ON restaurants(is_active);
```

#### **2. menus**
```sql
CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    emoji TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_menus_restaurant ON menus(restaurant_id);
CREATE INDEX idx_menus_active ON menus(is_active);
CREATE INDEX idx_menus_sort ON menus(sort_order);
```

#### **3. categories**
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID REFERENCES menus(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    emoji TEXT,
    description TEXT,
    is_visible BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_categories_menu ON categories(menu_id);
CREATE INDEX idx_categories_visible ON categories(is_visible);
CREATE INDEX idx_categories_sort ON categories(sort_order);
```

#### **4. products**
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    
    -- Customization
    allergens TEXT[] DEFAULT '{}', -- ['gluten', 'dairy', 'nuts', ...]
    labels TEXT[] DEFAULT '{}',    -- ['vegan', 'gluten-free', 'spicy', ...]
    extras JSONB DEFAULT '[]',     -- [{ name: 'Extra cheese', price: 1.50 }]
    options JSONB DEFAULT '[]',    -- [{ name: 'Size', values: ['S', 'M', 'L'] }]
    
    -- Availability
    is_available BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_available ON products(is_available);
CREATE INDEX idx_products_visible ON products(is_visible);
CREATE INDEX idx_products_sort ON products(sort_order);
```

#### **5. themes**
```sql
CREATE TABLE themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
    theme_id TEXT NOT NULL, -- 'modern-minimal', 'classic-bistro', etc.
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(restaurant_id, theme_id)
);

-- Indexes
CREATE INDEX idx_themes_restaurant ON themes(restaurant_id);
CREATE INDEX idx_themes_active ON themes(is_active);
```

### **Additional Tables**

- `restaurant_staff` - Staff management
- `customers` - Customer profiles
- `orders` - Order management
- `order_items` - Order line items
- `payments` - Payment tracking
- `tables` - Table management
- `service_requests` - Waiter calls
- `product_recommendations` - AI suggestions
- `marketing_campaigns` - Marketing automation
- ... (see `schema.sql` for complete list)

### **Row Level Security (RLS) Policies**

All tables have RLS enabled with policies for:

1. **Owners**: Full access to their restaurant data
2. **Staff**: Access based on role and location
3. **Public**: Read-only access to active menus/products
4. **Customers**: Access to their own orders

Example policy:
```sql
-- Restaurants: Owners can read/update their own restaurants
CREATE POLICY "Owners can manage their restaurants" ON restaurants
    FOR ALL USING (owner_id = auth.uid());

-- Products: Public can read active products
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (
        is_visible = true 
        AND is_available = true
    );
```

### **Complete Schema**

See `schema.sql` in the root directory for the complete, production-ready database schema.

---

## 🎨 THEME SYSTEM

### **Overview**

MyDigitable includes 5 professional, pre-designed themes optimized for different restaurant types.

### **Theme Architecture**

#### **1. Theme Definition** (`src/lib/theme/themes.ts`)

Each theme is defined with:
- **Metadata**: ID, name, description, target restaurant type
- **Tokens**: Color palette, typography, spacing, shadows
- **Customization**: Allowed customizations per plan tier

```typescript
interface ThemeDefinition {
    id: string
    name: string
    description: string
    thumbnail: string
    targetRestaurant: string
    tier: 'basic' | 'pro' | 'enterprise'
    tokens: ThemeTokens
    customization: {
        allowPrimaryColor: boolean
        allowFont: boolean
        allowFontSize: boolean
        availableFonts: ThemeFont[]
    }
}
```

#### **2. Theme Tokens** (`src/lib/theme/types.ts`)

```typescript
interface ThemeTokens {
    // Colors (RGB format for Tailwind opacity)
    colorPrimary: string        // "22 163 74"
    colorPrimaryText: string
    colorBackground: string
    colorSurface: string
    colorBorder: string
    colorTextPrimary: string
    colorTextSecondary: string
    colorTextMuted: string
    
    // Typography
    fontHeading: string         // "'DM Sans', sans-serif"
    fontBody: string
    fontPrice: string
    
    // Spacing & Shape
    radiusSm: string            // "0.5rem"
    radiusMd: string
    radiusLg: string
    radiusFull: string
    
    // Shadows
    shadowSm: string
    shadowMd: string
    shadowLg: string
    
    // Special
    headerBackground: string
    headerTextColor: string
    categoryActiveBackground: string
    categoryActiveText: string
    cartButtonBackground: string
    cartButtonText: string
}
```

### **The 5 Themes**

#### **1. Modern Minimal** (Default)
- **ID**: `modern-minimal`
- **Primary Color**: Green (#16A34A)
- **Target**: Cafeterías, brunch, healthy food
- **Vibe**: Clean, Google Material You, iOS-inspired
- **Fonts**: DM Sans (all)

#### **2. Classic Bistro**
- **ID**: `classic-bistro`
- **Primary Color**: Navy Blue (#1E3A5F)
- **Target**: French bistros, fine casual
- **Vibe**: Elegant, traditional, sophisticated
- **Fonts**: Playfair Display (headings), Lato (body)

#### **3. Craft & Bold**
- **ID**: `craft-bold`
- **Primary Color**: Copper (#C2783A)
- **Target**: Craft bars, burgers, BBQ
- **Vibe**: Dark, masculine, industrial
- **Fonts**: Bebas Neue (headings), Barlow (body)

#### **4. Nordic Clean**
- **ID**: `nordic-clean`
- **Primary Color**: Charcoal (#525252)
- **Target**: Nordic cafés, healthy bowls
- **Vibe**: Minimalist, photographic, Scandinavian
- **Fonts**: Cormorant Garamond (headings), Outfit (body)

#### **5. Warm Rustic**
- **ID**: `warm-rustic`
- **Primary Color**: Terracotta (#B45309)
- **Target**: Italian, Spanish, traditional
- **Vibe**: Warm, homey, family-style
- **Fonts**: Libre Baskerville (headings), Source Sans 3 (body)

### **Theme Application**

Themes are applied via CSS custom properties in `src/app/globals.css`:

```css
:root {
    --color-primary: 22 163 74;
    --color-background: 250 250 249;
    /* ... all theme tokens ... */
}
```

Usage in components:
```tsx
<div className="bg-[rgb(var(--color-primary))]">
    <h1 style={{ fontFamily: 'var(--font-heading)' }}>
        Title
    </h1>
</div>
```

### **Theme Switching**

1. User selects theme in MenuInspector
2. `onThemeChange` callback updates state
3. Server Action saves to database
4. CSS variables update via `apply-theme.ts`
5. Preview updates in real-time

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### **Authentication Flow**

1. **Registration** (`/register`)
   - Email + Password
   - Supabase Auth creates user
   - Redirect to onboarding

2. **Onboarding** (`/onboarding`)
   - Collect restaurant info
   - Create restaurant record
   - Set up initial menu
   - Redirect to dashboard

3. **Login** (`/login`)
   - Email + Password
   - Supabase Auth session
   - Redirect to dashboard

### **Session Management**

- **Browser**: `createBrowserClient()` from `@supabase/ssr`
- **Server**: `createServerClient()` with cookies
- **Middleware**: Automatic session refresh

### **Authorization (RLS)**

All database access is secured via PostgreSQL Row Level Security:

```sql
-- Example: Users can only access their own restaurant data
CREATE POLICY "Users access own restaurant" ON restaurants
    FOR ALL USING (owner_id = auth.uid());
```

---

## ⚡ SERVER ACTIONS

All API logic uses Next.js Server Actions for type-safe, server-side operations.

### **Location**: `src/app/dashboard/menu/actions.ts`

### **Menu Actions**

```typescript
// Create menu
async function createMenu(input: CreateMenuInput): Promise<ActionResult>

// Update menu
async function updateMenu(id: string, input: Partial<CreateMenuInput>): Promise<ActionResult>

// Delete menu
async function deleteMenu(id: string): Promise<ActionResult>

// Toggle menu active status
async function toggleMenuActive(id: string): Promise<ActionResult<boolean>>
```

### **Category Actions**

```typescript
// Create category
async function createCategory(input: CreateCategoryInput): Promise<ActionResult>

// Update category
async function updateCategory(id: string, input: Partial<CreateCategoryInput>): Promise<ActionResult>

// Delete category
async function deleteCategory(id: string): Promise<ActionResult>
```

### **Product Actions**

```typescript
// Create product
async function createProduct(input: CreateProductInput): Promise<ActionResult>

// Update product
async function updateProduct(id: string, input: Partial<CreateProductInput>): Promise<ActionResult>

// Delete product
async function deleteProduct(id: string): Promise<ActionResult>

// Toggle availability
async function toggleProductAvailable(id: string): Promise<ActionResult<boolean>>

// Duplicate product
async function duplicateProduct(id: string): Promise<ActionResult>

// Upload image
async function uploadProductImage(file: File, restaurantId: string, productId?: string): Promise<ActionResult<string>>

// Delete image
async function deleteProductImage(imageUrl: string): Promise<ActionResult>
```

### **Action Result Type**

```typescript
type ActionResult<T = undefined> = {
    success: boolean
    data?: T
    error?: string
}
```

### **Usage Example**

```typescript
'use client'

import { createProduct } from '@/app/dashboard/menu/actions'
import { toast } from 'sonner'

async function handleCreate(data: CreateProductInput) {
    const result = await createProduct(data)
    
    if (result.success) {
        toast.success('Product created!')
    } else {
        toast.error(result.error)
    }
}
```

---

## 🚀 DEPLOYMENT GUIDE

### **Prerequisites**

1. Supabase project created
2. Database schema applied (`schema.sql`)
3. Storage bucket created (`product-images`)
4. Environment variables configured

### **Environment Variables**

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### **Vercel Deployment** (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Project Settings → Environment Variables
```

### **Manual Deployment**

```bash
# Build
npm run build

# Start production server
npm start
```

### **Database Setup**

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run `schema.sql` in SQL Editor
3. Create storage bucket:
   - Name: `product-images`
   - Public: Yes
   - Allowed MIME types: `image/*`

### **Post-Deployment Checklist**

- [ ] Environment variables set
- [ ] Database schema applied
- [ ] Storage bucket created
- [ ] RLS policies enabled
- [ ] Test registration flow
- [ ] Test menu creation
- [ ] Test image upload
- [ ] Verify theme switching

---

## 🛠️ DEVELOPMENT WORKFLOW

### **Setup**

```bash
# Clone repository
git clone <repo-url>
cd mydigitable-v2

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

### **Available Commands**

```bash
# Development
npm run dev          # Start dev server (localhost:3000)

# Build
npm run build        # Production build
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### **Development Flow**

1. Create feature branch
2. Make changes
3. Test locally (`npm run dev`)
4. Type check (`npm run type-check`)
5. Lint (`npm run lint`)
6. Build (`npm run build`)
7. Commit and push
8. Create pull request

---

## 📝 CODE CONVENTIONS

### **File Naming**

- **Components**: PascalCase (`MenuDashboard.tsx`)
- **Utilities**: camelCase (`formatPrice.ts`)
- **Server Actions**: `actions.ts`
- **Types**: `types.ts` or inline

### **Component Structure**

```typescript
'use client' // If client component

import { useState } from 'react'
import { SomeIcon } from 'lucide-react'

// Types
interface MyComponentProps {
    title: string
    onAction: () => void
}

// Component
export function MyComponent({ title, onAction }: MyComponentProps) {
    const [state, setState] = useState(false)
    
    return (
        <div className="...">
            {/* JSX */}
        </div>
    )
}
```

### **Styling**

- Use Tailwind utility classes
- Avoid inline styles unless dynamic (theme variables)
- Use `cn()` utility for conditional classes

```typescript
import { cn } from '@/lib/utils'

<div className={cn(
    "base-classes",
    isActive && "active-classes",
    variant === 'primary' && "primary-classes"
)} />
```

### **TypeScript**

- **No `any`** - Define proper types
- Use interfaces for props
- Use type for unions/intersections
- Export types when shared

### **Server Actions**

- Always return `ActionResult<T>`
- Use `revalidatePath()` after mutations
- Handle errors gracefully
- Log errors to console

---

## ⚡ PERFORMANCE OPTIMIZATIONS

### **Implemented**

1. **Next.js 14 App Router**
   - Server Components by default
   - Automatic code splitting
   - Optimized bundling

2. **Database**
   - Indexed foreign keys
   - RLS for security
   - Efficient queries

3. **Images**
   - Supabase Storage CDN
   - Lazy loading
   - Responsive images

4. **Caching**
   - Server Component caching
   - `revalidatePath()` for mutations

### **Future Optimizations**

- [ ] Implement Next.js `<Image>` component
- [ ] Add image optimization pipeline
- [ ] Implement ISR for public menus
- [ ] Add Redis caching layer
- [ ] Optimize bundle size
- [ ] Add service worker for offline support

---

## 📊 METRICS & MONITORING

### **Performance Targets**

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### **Monitoring** (To be implemented)

- Vercel Analytics
- Sentry for error tracking
- PostHog for product analytics

---

## 🔄 VERSION HISTORY

- **v2.0.0** (February 2026) - Current version
  - Complete menu management system
  - 5 professional themes
  - Product panel with full customization
  - Image upload to Supabase Storage
  - Real-time preview

---

## 📞 SUPPORT & RESOURCES

- **Documentation**: This file (ARCHITECTURE.md)
- **Database Schema**: `schema.sql`
- **README**: `README.md`
- **Issues**: GitHub Issues
- **Contact**: support@mydigitable.com

---

**Last Updated**: February 12, 2026  
**Maintained by**: MyDigitable Team  
**Status**: Production Ready ✅
