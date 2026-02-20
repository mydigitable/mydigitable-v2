# MyDigitable - Configuración Completa de Base de Datos

## Conexión Supabase
```
URL: https://hpgnvqubbedfmqucjuvq.supabase.co
```

---

## TABLA: restaurants (PRINCIPAL)
```sql
id UUID PRIMARY KEY
owner_id UUID → auth.users (CASCADE)
name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL
description, logo_url, cover_url TEXT
email, phone, website, address, city, postal_code TEXT
country TEXT DEFAULT 'ES'
latitude DECIMAL(10,8), longitude DECIMAL(11,8)
subscription_plan TEXT DEFAULT 'basic' -- starter|basic|pro
subscription_status TEXT DEFAULT 'active'
stripe_customer_id, stripe_account_id TEXT
currency TEXT DEFAULT 'EUR'
timezone TEXT DEFAULT 'Europe/Madrid'
default_language TEXT DEFAULT 'es'
tax_rate DECIMAL(5,2) DEFAULT 21.00
mode_dine_in, mode_takeaway, mode_delivery, mode_beach, mode_pool BOOLEAN
accepts_orders, accepts_reservations, accepts_waiter_calls BOOLEAN
opening_hours JSONB, social_instagram, social_facebook, social_tiktok TEXT
primary_color TEXT DEFAULT '#22C55E', theme TEXT DEFAULT 'classic'
settings JSONB
is_active, is_open BOOLEAN DEFAULT true
onboarding_completed BOOLEAN DEFAULT false, onboarding_step INTEGER DEFAULT 1
created_at, updated_at TIMESTAMPTZ
```

---

## TABLA: staff
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
user_id UUID → auth.users (SET NULL)
name TEXT NOT NULL, email, phone, avatar_url, pin TEXT
role TEXT DEFAULT 'waiter' -- owner|manager|waiter|kitchen|cashier|host
permissions JSONB, is_active BOOLEAN, last_seen_at TIMESTAMPTZ
```

---

## TABLA: zones
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
name TEXT NOT NULL, description, icon TEXT DEFAULT '🍽️'
color TEXT DEFAULT '#22C55E', capacity INTEGER
sort_order INTEGER, is_active BOOLEAN
```

---

## TABLA: tables
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
zone_id UUID → zones (SET NULL)
table_number TEXT NOT NULL (UNIQUE con restaurant_id)
name TEXT, capacity INTEGER DEFAULT 4, min_capacity INTEGER DEFAULT 1
qr_token TEXT UNIQUE (auto-generado), qr_code_url TEXT
status TEXT DEFAULT 'available' -- available|occupied|reserved|calling_waiter|cleaning|blocked
position_x, position_y, sort_order INTEGER, is_active BOOLEAN
```

---

## TABLA: beach_locations
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
zone_id UUID → zones (SET NULL)
location_number TEXT NOT NULL (UNIQUE con restaurant_id)
row, zone_name TEXT, qr_token TEXT UNIQUE
latitude DECIMAL(10,8), longitude DECIMAL(11,8)
is_active, is_occupied BOOLEAN
```

---

## TABLA: menus
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
name TEXT NOT NULL, description, icon TEXT DEFAULT '📋'
schedule_enabled BOOLEAN, schedule_days INTEGER[], schedule_start_time, schedule_end_time TIME
show_prices, show_images BOOLEAN DEFAULT true
sort_order INTEGER, is_active, is_default BOOLEAN
```

---

## TABLA: categories
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
menu_id UUID → menus (SET NULL)
name_es TEXT NOT NULL, name_en, name_fr, name_de, name_pt, name_it, name_el TEXT
description_es, description_en TEXT
icon TEXT DEFAULT '🍽️', image_url TEXT
schedule_enabled BOOLEAN, available_from, available_to TIME
sort_order INTEGER, is_active BOOLEAN
```

---

## TABLA: products
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
category_id UUID → categories (CASCADE)
name_es TEXT NOT NULL, name_en, name_fr, name_de, name_pt, name_it, name_el TEXT
description_es, description_en TEXT
price DECIMAL(10,2) NOT NULL, compare_price, cost_price DECIMAL(10,2)
image_url TEXT
is_vegetarian, is_vegan, is_gluten_free BOOLEAN
allergens TEXT[], calories INTEGER, preparation_time INTEGER
stock_status TEXT DEFAULT 'in_stock' -- in_stock|low_stock|out_of_stock
stock_quantity INTEGER, sort_order INTEGER
is_available, is_featured BOOLEAN
```

---

## TABLA: modifier_groups
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
name_es TEXT NOT NULL, name_en TEXT
is_required BOOLEAN, min_selections, max_selections INTEGER
sort_order INTEGER, is_active BOOLEAN
```

## TABLA: modifier_options
```sql
id UUID PRIMARY KEY
group_id UUID → modifier_groups (CASCADE)
name_es TEXT NOT NULL, name_en TEXT
price_adjustment DECIMAL(10,2) DEFAULT 0
is_default BOOLEAN, sort_order INTEGER, is_available BOOLEAN
```

## TABLA: product_modifier_groups
```sql
product_id UUID → products (CASCADE)
group_id UUID → modifier_groups (CASCADE)
sort_order INTEGER
UNIQUE(product_id, group_id)
```

---

## TABLA: table_sessions (Social Dining)
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
table_id UUID → tables (CASCADE)
join_code TEXT NOT NULL (4 dígitos auto-generado)
session_token TEXT UNIQUE
status TEXT DEFAULT 'active' -- active|pending_payment|closed
guest_count INTEGER DEFAULT 1
started_at, closed_at, created_at TIMESTAMPTZ
```

## TABLA: session_participants
```sql
id UUID PRIMARY KEY
session_id UUID → table_sessions (CASCADE)
name TEXT NOT NULL, device_token TEXT
avatar_color TEXT DEFAULT '#22C55E'
is_host BOOLEAN, joined_at TIMESTAMPTZ
```

## TABLA: order_groups
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
session_id UUID → table_sessions (CASCADE)
round_number INTEGER DEFAULT 1
subtotal, tax_amount, discount_amount, total DECIMAL(10,2)
status TEXT DEFAULT 'draft' -- draft|submitted|confirmed|preparing|delivered
```

## TABLA: order_group_items
```sql
id UUID PRIMARY KEY
order_group_id UUID → order_groups (CASCADE)
product_id UUID → products (SET NULL)
participant_id UUID → session_participants (SET NULL)
product_name TEXT NOT NULL, quantity INTEGER, unit_price, line_total DECIMAL(10,2)
modifiers JSONB, notes TEXT
status TEXT -- pending|preparing|ready|delivered|cancelled
```

## TABLA: order_item_allocations (Split Bill)
```sql
id UUID PRIMARY KEY
order_group_item_id UUID → order_group_items (CASCADE)
participant_id UUID → session_participants (CASCADE)
fraction DECIMAL(5,4) DEFAULT 1.0 (0 < fraction <= 1)
amount DECIMAL(10,2) NOT NULL
is_paid BOOLEAN, paid_at TIMESTAMPTZ, payment_intent_id TEXT
UNIQUE(order_group_item_id, participant_id)
```

---

## TABLA: orders
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
table_id UUID → tables (SET NULL)
session_id UUID → table_sessions (SET NULL)
beach_location_id UUID → beach_locations (SET NULL)
order_number TEXT NOT NULL (auto: YYMMDD0001)
order_type TEXT -- dine_in|takeaway|delivery|beach|pool
customer_name, customer_phone, customer_email, delivery_address TEXT
subtotal, tax_amount, discount_amount, tip_amount, total DECIMAL(10,2)
status TEXT DEFAULT 'pending' -- pending|confirmed|preparing|ready|delivered|completed|cancelled
payment_status TEXT -- pending|partial|paid|refunded
payment_method TEXT, stripe_payment_intent_id TEXT
notes TEXT, estimated_time INTEGER
assigned_staff_id UUID → staff (SET NULL)
created_at, updated_at, confirmed_at, completed_at TIMESTAMPTZ
```

## TABLA: order_items
```sql
id UUID PRIMARY KEY
order_id UUID → orders (CASCADE)
product_id UUID → products (SET NULL)
product_name TEXT NOT NULL, quantity INTEGER, unit_price, line_total DECIMAL(10,2)
modifiers JSONB, notes TEXT
status TEXT -- pending|preparing|ready|delivered|cancelled
```

---

## TABLA: customers
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
user_id UUID → auth.users (SET NULL)
name, email, phone TEXT
total_orders INTEGER, total_spent, average_order DECIMAL(10,2)
loyalty_points INTEGER, loyalty_tier TEXT -- bronze|silver|gold|platinum
preferences JSONB
UNIQUE(restaurant_id, email)
```

## TABLA: promotions
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
name TEXT NOT NULL, description, code TEXT
type TEXT -- percentage|fixed|bogo|free_item
value, min_order_amount, max_discount DECIMAL(10,2)
max_uses, uses_count INTEGER
valid_from, valid_to TIMESTAMPTZ, is_active BOOLEAN
```

## TABLA: waiter_calls
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
table_id UUID → tables (SET NULL)
table_number TEXT NOT NULL
reason TEXT -- waiter|bill|question|complaint|utensils|water|other
notes TEXT, priority TEXT -- low|normal|high|urgent
status TEXT -- pending|acknowledged|in_progress|completed|cancelled
assigned_to UUID → staff (SET NULL)
```

## TABLA: reviews
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
order_id UUID → orders (SET NULL)
rating INTEGER 1-5 NOT NULL
food_rating, service_rating INTEGER 1-5
comment, reply TEXT, replied_at TIMESTAMPTZ
is_public BOOLEAN
```

## TABLA: daily_metrics
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
date DATE NOT NULL
total_orders, total_sessions, total_guests INTEGER
total_revenue, total_tips, average_order_value DECIMAL(10,2)
dine_in_orders, takeaway_orders, delivery_orders, beach_orders INTEGER
UNIQUE(restaurant_id, date)
```

## TABLA: notifications
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
staff_id UUID → staff (CASCADE)
type TEXT -- new_order|order_update|waiter_call|low_stock|review|payment|system
title TEXT NOT NULL, message TEXT, data JSONB
is_read BOOLEAN, read_at TIMESTAMPTZ
```

## TABLA: integrations
```sql
id UUID PRIMARY KEY
restaurant_id UUID → restaurants (CASCADE)
type TEXT -- stripe|pos|printer|kitchen_display|accounting|delivery
name TEXT NOT NULL, config JSONB, webhook_url TEXT
is_active BOOLEAN, last_sync_at TIMESTAMPTZ
```

## TABLA: order_events (Auditoría)
```sql
id UUID PRIMARY KEY
order_id UUID → orders (CASCADE)
event_type TEXT NOT NULL
actor_type TEXT -- customer|staff|system
actor_id, actor_name TEXT, data JSONB
```

---

## RLS (Row Level Security)

Todas las tablas tienen RLS habilitado.

**Política Owner:**
```sql
restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
```

**Políticas Públicas:**
- categories, products, menus: `FOR SELECT WHERE is_active = true`
- table_sessions, session_participants, order_groups: `FOR ALL USING (true)`
- waiter_calls: `FOR INSERT WITH CHECK (true)`

---

## Índices
```sql
idx_restaurants_owner(owner_id), idx_restaurants_slug(slug)
idx_tables_qr_token(qr_token), idx_tables_status(restaurant_id, status)
idx_products_category(category_id), idx_products_available(restaurant_id, is_available)
idx_orders_status(restaurant_id, status), idx_orders_created(created_at DESC)
idx_sessions_code(join_code)
```

---

## Triggers
1. `update_updated_at` → Auto-actualiza `updated_at` en UPDATE
2. `generate_order_number` → Formato YYMMDD + 4 dígitos secuenciales
3. `generate_session_code` → Código único 4 dígitos para join

---

## Realtime
Tablas con Realtime habilitado:
- orders, order_items, table_sessions, order_groups, waiter_calls, tables, notifications
