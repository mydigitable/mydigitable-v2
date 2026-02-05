// =====================================================
// TIPOS TYPESCRIPT PARA TODAS LAS TABLAS DE SUPABASE
// =====================================================

// ============ PLATAFORMA (Admin - María) ============

export interface PlatformAdmin {
    id: string;
    user_id: string;
    email: string;
    name: string | null;
    role: 'super_admin' | 'admin' | 'support';
    permissions: Record<string, any>;
    is_active: boolean;
    last_login: string | null;
    created_at: string;
}

export interface PlatformSettings {
    id: string;
    platform_name: string;
    support_email: string | null;
    support_phone: string | null;
    commission_rate_starter: number;
    price_starter_monthly: number;
    price_starter_yearly: number;
    price_basic_monthly: number;
    price_basic_yearly: number;
    price_pro_monthly: number;
    price_pro_yearly: number;
    stripe_account_id: string | null;
    stripe_webhook_secret: string | null;
    default_currency: string;
    default_timezone: string;
    created_at: string;
    updated_at: string;
}

export interface Seller {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    commission_rate: number;
    commission_type: 'first_sale' | 'first_year' | 'lifetime';
    status: 'active' | 'inactive' | 'terminated';
    total_sales: number;
    total_restaurants: number;
    total_revenue: number;
    total_earned: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Subscription {
    id: string;
    restaurant_id: string;
    plan: 'starter' | 'basic' | 'pro';
    billing_cycle: 'monthly' | 'yearly' | null;
    status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'paused';
    current_period_start: string | null;
    current_period_end: string | null;
    trial_end: string | null;
    cancel_at_period_end: boolean;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    stripe_subscription_id: string | null;
    stripe_customer_id: string | null;
    stripe_price_id: string | null;
    seller_id: string | null;
    previous_plan: string | null;
    plan_changed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface SubscriptionPayment {
    id: string;
    subscription_id: string;
    restaurant_id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'succeeded' | 'failed' | 'refunded';
    payment_type: 'subscription' | 'upgrade' | 'one_time';
    stripe_payment_intent_id: string | null;
    stripe_invoice_id: string | null;
    stripe_charge_id: string | null;
    invoice_number: string | null;
    invoice_url: string | null;
    paid_at: string | null;
    failed_at: string | null;
    failure_reason: string | null;
    created_at: string;
}

export interface PlatformCommission {
    id: string;
    restaurant_id: string;
    order_id: string;
    order_total: number;
    commission_rate: number;
    commission_amount: number;
    status: 'pending' | 'collected' | 'paid' | 'failed' | 'waived';
    stripe_transfer_id: string | null;
    collected_at: string | null;
    paid_at: string | null;
    created_at: string;
}

export interface SellerSale {
    id: string;
    seller_id: string;
    restaurant_id: string;
    subscription_id: string;
    plan_sold: string;
    billing_cycle: string;
    sale_amount: number;
    commission_rate: number;
    commission_amount: number;
    status: 'pending' | 'approved' | 'paid' | 'cancelled';
    approved_at: string | null;
    paid_at: string | null;
    created_at: string;
}

export interface PlatformMetrics {
    id: string;
    date: string;
    total_restaurants: number;
    new_restaurants: number;
    churned_restaurants: number;
    restaurants_starter: number;
    restaurants_basic: number;
    restaurants_pro: number;
    mrr: number;
    subscription_revenue: number;
    commission_revenue: number;
    total_revenue: number;
    total_orders: number;
    total_gmv: number;
    created_at: string;
    updated_at: string;
}

// ============ RESTAURANTE ============

export type SubscriptionPlan = 'starter' | 'basic' | 'pro';
export type RestaurantMode = 'restaurant' | 'beach' | 'pool';

export interface Restaurant {
    id: string;
    owner_id: string;
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    cover_url: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    country: string;

    // Suscripción
    subscription_plan: SubscriptionPlan;
    seller_id: string | null;

    // Datos de facturación
    business_name: string | null;
    tax_id: string | null;
    billing_email: string | null;
    billing_address: string | null;

    // Stripe
    stripe_account_id: string | null;
    stripe_account_status: string;

    // Modos de operación
    mode_restaurant: boolean;
    mode_beach: boolean;
    mode_pool: boolean;

    // Configuración
    currency: string;
    timezone: string;
    default_language: string;
    opening_hours: Record<string, any>;

    // Capacidades
    accepts_orders: boolean;
    accepts_reservations: boolean;
    accepts_waiter_calls: boolean;
    accepts_delivery: boolean;
    accepts_takeaway: boolean;

    // Nuevo: Tipo de negocio y eventos
    business_type: string | null;
    mode_events: boolean;

    // Nuevo: Redes sociales
    social_instagram: string | null;
    social_facebook: string | null;
    social_tiktok: string | null;

    // Nuevo: Pagos y apariencia
    payment_settings: Record<string, any> | null;
    primary_color: string | null;
    theme_id: string | null;

    // Estado
    is_active: boolean;
    onboarding_completed: boolean;
    onboarding_step: number;

    // Baja
    cancelled_at: string | null;
    cancellation_reason: string | null;

    // Tema
    theme: string;
    custom_css: string | null;

    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    restaurant_id: string;
    name_es: string;
    name_en: string | null;
    description_es: string | null;
    description_en: string | null;
    icon: string;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
    schedule_enabled: boolean;
    available_from: string | null;
    available_to: string | null;
    created_at: string;
    updated_at: string;
    // Nested
    products?: Product[];
}

export interface Product {
    id: string;
    category_id: string;
    restaurant_id: string;
    name_es: string;
    name_en: string | null;
    description_es: string | null;
    description_en: string | null;
    price: number;
    compare_price: number | null;
    image_url: string | null;
    is_available: boolean;
    is_featured: boolean;
    sort_order: number;
    allergens: string[] | null;
    is_vegetarian: boolean;
    is_vegan: boolean;
    is_gluten_free: boolean;
    calories: number | null;
    preparation_time: number | null;
    created_at: string;
    updated_at: string;
    // Nested
    modifiers?: ProductModifier[];
}

export interface ProductModifier {
    id: string;
    restaurant_id: string;
    product_id: string | null; // null = global modifier
    name_es: string;
    name_en: string | null;
    type: 'single' | 'multiple';
    is_required: boolean;
    min_selections: number;
    max_selections: number | null;
    options: ModifierOption[];
    sort_order: number;
    is_active: boolean;
    created_at: string;
}

export interface ModifierOption {
    id: string;
    name_es: string;
    name_en: string | null;
    price_adjustment: number;
    is_default: boolean;
}

export interface Table {
    id: string;
    restaurant_id: string;
    table_number: string;
    capacity: number;
    zone: string | null;
    position_x: number | null;
    position_y: number | null;
    qr_code: string | null;
    status: 'available' | 'occupied' | 'reserved' | 'unavailable';
    current_session_id: string | null;
    is_active: boolean;
    created_at: string;
}

export interface BeachLocation {
    id: string;
    restaurant_id: string;
    location_number: string;
    row: string | null;
    zone: string | null;
    is_active: boolean;
    created_at: string;
}

// ============ PEDIDOS ============

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
export type OrderType = 'dine_in' | 'takeaway' | 'delivery' | 'beach' | 'pool';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'online';

export interface Order {
    id: string;
    restaurant_id: string;
    order_number: string;
    table_number: string | null;
    customer_name: string | null;
    customer_phone: string | null;
    order_type: OrderType;
    status: OrderStatus;
    items: OrderItem[];
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total: number;
    notes: string | null;
    payment_status: PaymentStatus;
    payment_method: PaymentMethod | null;
    stripe_payment_intent_id: string | null;
    promotion_id: string | null;
    promotion_code: string | null;
    estimated_time: number | null;
    prepared_at: string | null;
    delivered_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    modifiers: SelectedModifier[];
    notes: string | null;
}

export interface SelectedModifier {
    name: string;
    option: string;
    price: number;
}

// ============ SERVICIOS ============

export type WaiterCallStatus = 'pending' | 'acknowledged' | 'in_progress' | 'completed' | 'cancelled';
export type WaiterCallPriority = 'normal' | 'high' | 'urgent';

export interface WaiterCall {
    id: string;
    restaurant_id: string;
    table_number: string;
    reason: string;
    notes: string | null;
    priority: WaiterCallPriority;
    status: WaiterCallStatus;
    assigned_to: string | null;
    acknowledged_at: string | null;
    completed_at: string | null;
    created_at: string;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';

export interface Reservation {
    id: string;
    restaurant_id: string;
    customer_name: string;
    customer_email: string | null;
    customer_phone: string;
    date: string;
    time: string;
    party_size: number;
    table_id: string | null;
    status: ReservationStatus;
    special_requests: string | null;
    needs_high_chair: boolean;
    needs_baby_seat: boolean;
    needs_wheelchair: boolean;
    is_birthday: boolean;
    is_anniversary: boolean;
    has_pets: boolean;
    dietary_restrictions: string | null;
    notes: string | null;
    confirmation_code: string;
    confirmed_at: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    created_at: string;
    updated_at: string;
}

// ============ CRM ============

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type StaffRole = 'owner' | 'manager' | 'waiter' | 'kitchen' | 'cashier';

export interface Customer {
    id: string;
    restaurant_id: string;
    name: string;
    email: string | null;
    phone: string | null;
    total_orders: number;
    total_spent: number;
    average_order: number;
    loyalty_tier: LoyaltyTier;
    loyalty_points: number;
    last_visit: string | null;
    notes: string | null;
    preferences: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface Staff {
    id: string;
    restaurant_id: string;
    name: string;
    email: string | null;
    phone: string | null;
    pin: string | null;
    role: StaffRole;
    permissions: string[];
    is_active: boolean;
    last_login: string | null;
    created_at: string;
    updated_at: string;
}

// ============ MARKETING ============

export type PromotionType = 'percentage' | 'fixed' | 'bogo' | 'free_item' | 'free_shipping';

export interface Promotion {
    id: string;
    restaurant_id: string;
    name: string;
    description: string | null;
    type: PromotionType;
    value: number;
    code: string | null;
    min_order_amount: number | null;
    max_discount: number | null;
    applies_to: 'all' | 'category' | 'product';
    applicable_items: string[];
    valid_from: string;
    valid_to: string;
    max_uses: number | null;
    max_uses_per_customer: number | null;
    uses_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PromotionUse {
    id: string;
    promotion_id: string;
    order_id: string;
    customer_id: string | null;
    discount_amount: number;
    created_at: string;
}

// ============ ANALYTICS ============

export interface DailyMetrics {
    id: string;
    restaurant_id: string;
    date: string;
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    total_customers: number;
    new_customers: number;
    total_reservations: number;
    waiter_calls: number;
    average_response_time: number | null;
    top_products: TopProduct[];
    orders_by_hour: Record<string, number>;
    created_at: string;
    updated_at: string;
}

export interface TopProduct {
    product_id: string;
    product_name: string;
    quantity: number;
    revenue: number;
}

// ============ NOTIFICACIONES ============

export type NotificationType = 'order' | 'reservation' | 'waiter_call' | 'system' | 'promotion';

export interface Notification {
    id: string;
    restaurant_id: string;
    type: NotificationType;
    title: string;
    message: string;
    data: Record<string, any>;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
}

// ============ REVIEWS ============

export interface Review {
    id: string;
    restaurant_id: string;
    order_id: string | null;
    customer_name: string | null;
    rating: number;
    comment: string | null;
    is_published: boolean;
    response: string | null;
    responded_at: string | null;
    created_at: string;
}

// ============ UTILS ============

export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    loading: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    count: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
