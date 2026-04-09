// ============================================================
// MYDIGITABLE V5 - TypeScript Types
// Generado para el schema SQL V5 (Feb 2026)
// ============================================================

// ENUMS
export type PlanTier = 'basic' | 'pro' | 'premium'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'paused'
export type BusinessType = 'restaurant' | 'cafe' | 'bar' | 'hotel' | 'beach_club' | 'event'
export type StaffRole = 'owner' | 'manager' | 'waiter' | 'chef' | 'host'
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'canceled'
export type OrderType = 'dine_in' | 'takeaway' | 'delivery' | 'room_service' | 'beach' | 'event'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'card' | 'cash' | 'apple_pay' | 'google_pay' | 'room_charge' | 'mixed'
export type TipDistributionType = 'individual' | 'shared'
export type TipPayout = 'end_of_shift' | 'daily' | 'weekly'
export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'canceled' | 'no_show'
export type KitchenMode = 'tablet' | 'integrated' | 'print_only'
export type LocationMode = 'fixed_table' | 'gps_free' | 'room_number' | 'sector_seat' | 'pickup_point'

// MULTI-IDIOMA
export interface MultiLang {
  es: string
  en?: string
  de?: string
  pt?: string
  it?: string
  fr?: string
  el?: string
}

// RESTAURANT
export interface Restaurant {
  id: string
  owner_id: string
  name: string
  slug: string
  business_type: BusinessType
  plan_tier: PlanTier
  subscription_status: SubscriptionStatus
  subscription_started_at: string
  next_billing_date: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  total_locations: number
  location_discount_percent: number
  base_price: number
  monthly_total: number
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  city: string | null
  country: string
  logo_url: string | null
  cover_image_url: string | null
  primary_color: string
  secondary_color: string
  default_language: string
  supported_languages: string[]
  auto_detect_language: boolean
  timezone: string
  currency: string
  is_active: boolean
  is_accepting_orders: boolean
  onboarding_completed: boolean
  theme_id: string
  theme_primary_color: string | null
  theme_font: string | null
  theme_font_size: string
  created_at: string
  updated_at: string
}

// RESTAURANT CONFIG - JSONB types
export interface WorkingHours {
  open: string
  close: string
  closed: boolean
}

export interface MenuSchedule {
  start: string
  end: string
  enabled: boolean
}

export interface OperationalSettings {
  location_mode: LocationMode
  has_delivery: boolean
  has_beach_service: boolean
  has_room_service: boolean
  has_zones: boolean
  payment_timing: 'before' | 'after' | 'on_receive'
  accepts_cash: boolean
  working_hours: {
    monday: WorkingHours
    tuesday: WorkingHours
    wednesday: WorkingHours
    thursday: WorkingHours
    friday: WorkingHours
    saturday: WorkingHours
    sunday: WorkingHours
  }
  menu_schedules: {
    breakfast: MenuSchedule
    lunch: MenuSchedule
    dinner: MenuSchedule
  }
  auto_switch_menus: boolean
  auto_free_tables_after_hours: number
  room_service_enabled: boolean
  floor_numbers: number[]
  gps_mode_enabled: boolean
  gps_radius_meters: number
  sector_mode_enabled: boolean
  seat_numbering_enabled: boolean
  pre_orders_enabled: boolean
}

export interface StaffSettings {
  waiters_enabled: boolean
  zones_assignment_enabled: boolean
  notifications_mode: 'all' | 'zone_only'
  call_waiter_enabled: boolean
  call_motives: string[]
  tips_enabled: boolean
  tip_suggestions: number[]
  tips_distribution: TipDistributionType
  tips_payout: TipPayout
  confirm_served: boolean
}

export interface KitchenSettings {
  kitchen_enabled: boolean
  kitchen_mode: KitchenMode
  enable_prep_timer: boolean
  default_prep_time_minutes: number
  alert_if_late_minutes: number
  chef_can_call_waiter: boolean
}

export interface CustomerSettings {
  shared_table_enabled: boolean
  shared_table_expiry_hours: number
  show_call_waiter_button: boolean
  show_order_progress: boolean
  allow_cancel_order: boolean
  show_allergens: boolean
  show_dietary_filters: boolean
  auto_detect_language: boolean
}

export interface QrSettings {
  mode: 'per_table' | 'global'
  color: string
  custom_text: string
  include_logo: boolean
}

export interface ThemeSettings {
  menu_theme: string
  dashboard_theme: string
  custom_css: string | null
}

export interface ReservationsSettings {
  reservations_enabled: boolean
  min_party_size: number
  max_party_size: number
  booking_advance_days: number
  default_duration_minutes: number
  send_confirmation_email: boolean
  allow_cancellation: boolean
  cancellation_deadline_hours: number
}

export interface RestaurantConfig {
  id: string
  restaurant_id: string
  operational_settings: OperationalSettings
  staff_settings: StaffSettings
  kitchen_settings: KitchenSettings
  customer_settings: CustomerSettings
  qr_settings: QrSettings
  theme_settings: ThemeSettings
  reservations_settings: ReservationsSettings
  created_at: string
  updated_at: string
}

// LOCATIONS
export interface RestaurantLocation {
  id: string
  restaurant_id: string
  name: string
  slug: string
  address: string
  city: string
  country: string
  phone: string | null
  email: string | null
  is_main: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// ZONES
export interface Zone {
  id: string
  restaurant_id: string
  location_id: string | null
  name: string
  color: string
  is_active: boolean
  display_order: number
  created_at: string
}

// TABLES
export interface Table {
  id: string
  restaurant_id: string
  location_id: string | null
  zone_id: string | null
  table_number: string
  capacity: number
  qr_slug: string
  latitude: number | null
  longitude: number | null
  sector: string | null
  row_number: string | null
  seat_number: string | null
  status: TableStatus
  is_active: boolean
  created_at: string
  updated_at: string
}

// STAFF
export interface StaffMember {
  id: string
  restaurant_id: string
  user_id: string
  location_id: string | null
  role: StaffRole
  assigned_zone_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// MENU
export interface MenuCategory {
  id: string
  restaurant_id: string
  name: MultiLang
  description: MultiLang | null
  icon: string | null
  image_url: string | null
  active_schedule: 'all_day' | 'breakfast' | 'lunch' | 'dinner' | null
  display_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  restaurant_id: string
  category_id: string
  name: MultiLang
  description: MultiLang | null
  price: number
  terrace_price: number | null
  cost_price: number | null
  image_url: string | null
  is_available: boolean
  stock_quantity: number | null
  track_stock: boolean
  allergens: string[]
  dietary_tags: string[]
  is_featured: boolean
  imported_via_ai: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface ProductModifier {
  id: string
  product_id: string
  name: MultiLang
  type: 'size' | 'extra' | 'option' | 'remove'
  price_adjustment: number
  is_required: boolean
  allow_multiple: boolean
  display_order: number
  created_at: string
}

export interface ProductRecommendation {
  id: string
  restaurant_id: string
  base_product_id: string
  suggested_product_id: string
  rule_type: 'manual' | 'ai_generated'
  weight_score: number
  created_at: string
}

// MESA COMPARTIDA
export interface TableSession {
  id: string
  restaurant_id: string
  table_id: string
  pin: string
  created_at: string
  expires_at: string
  closed_at: string | null
}

export interface SessionParticipant {
  id: string
  session_id: string
  user_session_id: string
  nickname: string | null
  color: string
  joined_at: string
  left_at: string | null
}

// ORDERS
export interface Order {
  id: string
  restaurant_id: string
  table_id: string | null
  location_id: string | null
  order_number: string
  order_type: OrderType
  status: OrderStatus
  is_shared_session: boolean
  session_id: string | null
  assigned_waiter_id: string | null
  subtotal: number
  tax_amount: number
  tip_amount: number
  discount_amount: number
  total: number
  customer_notes: string | null
  kitchen_notes: string | null
  room_number: string | null
  guest_name: string | null
  delivery_address: string | null
  delivery_notes: string | null
  created_at: string
  confirmed_at: string | null
  preparing_at: string | null
  ready_at: string | null
  served_at: string | null
  completed_at: string | null
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  ordered_by_participant_id: string | null
  paid_by_participant_id: string | null
  gifted_by_participant_id: string | null
  quantity: number
  unit_price: number
  modifiers: Array<{
    modifier_id: string
    name: string
    price_adjustment: number
  }> | null
  subtotal: number
  notes: string | null
  created_at: string
}

// PAYMENTS
export interface Payment {
  id: string
  restaurant_id: string
  order_id: string
  paid_by_participant_id: string | null
  amount: number
  tip_amount: number
  total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  stripe_payment_intent_id: string | null
  paid_at: string | null
  refunded_at: string | null
  refund_amount: number | null
  created_at: string
}

export interface TipDistribution {
  id: string
  restaurant_id: string
  payment_id: string
  waiter_id: string
  amount: number
  distribution_type: TipDistributionType
  payout_status: 'pending' | 'paid'
  payout_date: string | null
  created_at: string
}

// WAITER CALLS
export interface WaiterCall {
  id: string
  restaurant_id: string
  table_id: string
  assigned_waiter_id: string | null
  reason: string
  custom_reason: string | null
  status: 'pending' | 'acknowledged' | 'completed'
  called_at: string
  acknowledged_at: string | null
  completed_at: string | null
}

// RESERVATIONS
export interface Reservation {
  id: string
  restaurant_id: string
  table_id: string | null
  customer_name: string
  customer_email: string | null
  customer_phone: string
  party_size: number
  reservation_date: string
  reservation_time: string
  duration_minutes: number
  status: ReservationStatus
  notes: string | null
  created_at: string
  updated_at: string
}

// CUSTOMER METRICS
export interface CustomerMetric {
  id: string
  restaurant_id: string
  customer_identifier: string
  total_orders: number
  total_spent: number
  average_ticket: number
  last_visit: string | null
  created_at: string
  updated_at: string
}

// ONBOARDING CONFIG (localStorage)
export interface OnboardingConfig {
  userId: string
  email: string
  businessName: string
  businessType: BusinessType
  numberOfLocations: number
  planTier: PlanTier
  basePrice: number
  discount: number
  monthlyTotal: number
  timestamp: string
}

// PLAN FEATURES
export const PLAN_FEATURES = {
  basic: {
    maxStaff: 3,
    themes: 3,
    languages: 3,
    sharedTable: false,
    aiMenuImport: false,
    kds: false,
    waiterApp: false,
    aiSuggestions: false,
    chatbot: false,
    posIntegration: false,
    delivery: false,
    reservations: false,
    terracePrice: false,
    promotions: false,
    exactStock: false,
    advancedAnalytics: false,
    beachMode: false,
    hotelMode: false,
    eventMode: false,
    whiteLabel: false,
    apiAccess: false,
    financialControl: false,
  },
  pro: {
    maxStaff: 10,
    themes: 20,
    languages: 7,
    sharedTable: true,
    aiMenuImport: true,
    kds: true,
    waiterApp: true,
    aiSuggestions: true,
    chatbot: true,
    posIntegration: true,
    delivery: true,
    reservations: true,
    terracePrice: true,
    promotions: true,
    exactStock: true,
    advancedAnalytics: true,
    beachMode: false,
    hotelMode: false,
    eventMode: false,
    whiteLabel: false,
    apiAccess: false,
    financialControl: false,
  },
  premium: {
    maxStaff: 999,
    themes: 999,
    languages: 999,
    sharedTable: true,
    aiMenuImport: true,
    kds: true,
    waiterApp: true,
    aiSuggestions: true,
    chatbot: true,
    posIntegration: true,
    delivery: true,
    reservations: true,
    terracePrice: true,
    promotions: true,
    exactStock: true,
    advancedAnalytics: true,
    beachMode: true,
    hotelMode: true,
    eventMode: true,
    whiteLabel: true,
    apiAccess: true,
    financialControl: true,
  },
} as const

export type PlanFeatures = typeof PLAN_FEATURES[PlanTier]

export function planHasFeature(
  plan: PlanTier,
  feature: keyof PlanFeatures
): boolean {
  const val = PLAN_FEATURES[plan][feature]
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val > 0
  return false
}

// PRICING HELPER
export function calculatePricing(plan: PlanTier, locations: number) {
  const basePrice = plan === 'basic' ? 49 : plan === 'pro' ? 99 : 150
  const discount = locations === 1 ? 0 : locations <= 5 ? 5 : 10
  const monthlyTotal = basePrice * locations * (1 - discount / 100)
  return { basePrice, discount, monthlyTotal }
}

// SUPABASE DATABASE TYPE
export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: Restaurant
        Insert: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Restaurant, 'id'>>
      }
      restaurant_config: {
        Row: RestaurantConfig
        Insert: Omit<RestaurantConfig, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<RestaurantConfig, 'id'>>
      }
      restaurant_locations: {
        Row: RestaurantLocation
        Insert: Omit<RestaurantLocation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<RestaurantLocation, 'id'>>
      }
      zones: {
        Row: Zone
        Insert: Omit<Zone, 'id' | 'created_at'>
        Update: Partial<Omit<Zone, 'id'>>
      }
      tables: {
        Row: Table
        Insert: Omit<Table, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Table, 'id'>>
      }
      staff_members: {
        Row: StaffMember
        Insert: Omit<StaffMember, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<StaffMember, 'id'>>
      }
      menu_categories: {
        Row: MenuCategory
        Insert: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MenuCategory, 'id'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id'>>
      }
      product_modifiers: {
        Row: ProductModifier
        Insert: Omit<ProductModifier, 'id' | 'created_at'>
        Update: Partial<Omit<ProductModifier, 'id'>>
      }
      table_sessions: {
        Row: TableSession
        Insert: Omit<TableSession, 'id' | 'created_at'>
        Update: Partial<Omit<TableSession, 'id'>>
      }
      session_participants: {
        Row: SessionParticipant
        Insert: Omit<SessionParticipant, 'id' | 'joined_at'>
        Update: Partial<Omit<SessionParticipant, 'id'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id'>>
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, 'id' | 'created_at'>
        Update: Partial<Omit<OrderItem, 'id'>>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at'>
        Update: Partial<Omit<Payment, 'id'>>
      }
      tip_distributions: {
        Row: TipDistribution
        Insert: Omit<TipDistribution, 'id' | 'created_at'>
        Update: Partial<Omit<TipDistribution, 'id'>>
      }
      waiter_calls: {
        Row: WaiterCall
        Insert: Omit<WaiterCall, 'id' | 'called_at'>
        Update: Partial<Omit<WaiterCall, 'id'>>
      }
      reservations: {
        Row: Reservation
        Insert: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Reservation, 'id'>>
      }
      customer_metrics: {
        Row: CustomerMetric
        Insert: Omit<CustomerMetric, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CustomerMetric, 'id'>>
      }
    }
  }
}
