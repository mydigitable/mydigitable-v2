# 🚀 PLAN DE DESARROLLO MYDIGITABLE - MVP COMPLETO

**Objetivo:** Crear el menú digital más completo y profesional del mercado  
**Inspiración:** storekit.com + diferenciales únicos  
**Colores:** Verde + Amarillo (ya configurados)

---

## 💰 NUEVO MODELO DE NEGOCIO

### **Plan FREE (€0/mes)**
- ❌ Sin cuota mensual
- ✅ Comisión del **9%** por pedido procesado
- ✓ Menú digital básico
- ✓ Códigos QR
- ✓ Hasta 30 productos
- ✓ 1 idioma (Español)
- ✓ Solo Dine-In

### **Plan BASIC (€40/mes)**
- ✅ Sin comisiones
- ✓ Hasta 100 productos
- ✓ Todas las categorías
- ✓ 2 idiomas (ES + EN)
- ✓ Dine-In + Takeaway
- ✓ Personalización básica (colores)
- ✓ Soporte email

### **Plan PRO (€90/mes)**
- ✅ Sin comisiones
- ✓ **Productos ilimitados**
- ✓ **4 idiomas** (ES, EN, FR, DE)
- ✓ **Todos los modos:** Dine-In, Beach Service, Delivery, Takeaway
- ✓ **Dominio propio** (menu.tu-restaurante.com)
- ✓ **Analytics avanzado**
- ✓ **Multi-ubicaciones**
- ✓ **Promociones y cupones**
- ✓ **API acceso**
- ✓ Soporte prioritario

**Garantía:** 7 días de reembolso en todos los planes

---

## 🎯 DIFERENCIALES ÚNICOS DE MYDIGITABLE

### **1. Beach Service Mode (ÚNICO EN EL MERCADO)**
- QR codes en hamacas y sombrillas
- Geolocalización en el mapa de playa
- Ideal para chiringuitos y beach clubs
- **Ningún competidor tiene esto**

### **2. Waiter Call System (Tiempo Real)**
- Botón de "Llamar camarero" desde el menú
- Tipos: Asistencia, Cuenta, Queja, Urgente
- Sistema de prioridades automático
- Dashboard en tiempo real para staff

### **3. Multi-Tenant con Límites Inteligentes**
- Límites forzados a nivel de base de datos
- Upgrade automático con Stripe
- Notificaciones cuando se acerca al límite

### **4. Sistema de Temas Visual**
- 5 temas profesionales pre-diseñados
- Personalización de colores por restaurante
- Preview en tiempo real

### **5. Analytics Pro**
- Productos más vendidos
- Horas pico
- Conversión menú → pedido
- Ventas por tipo de pedido
- **Todo en tiempo real**

### **6. Menú Multi-Idioma Inline**
- Sin tablas adicionales complejas
- Fallback automático al español
- Cambio de idioma instantáneo
- SEO optimizado por idioma

---

## 📅 PLAN DE DESARROLLO - 8 FASES

### **FASE 0: Infraestructura** ✅ COMPLETADA (20%)
- [x] Next.js 14 + TypeScript
- [x] Supabase (14 tablas, RLS, índices)
- [x] Componentes UI base
- [x] Sistema de temas
- [x] Storage buckets
- [x] Build funcionando

---

### **FASE 1: Landing Page Pro** (20% → 30%)

**Objetivo:** Landing impactante estilo storekit.com

**Páginas:**
1. **Home** (`/`)
   - Hero con demo interactivo del menú
   - Sección "¿Cómo funciona?" (3 pasos)
   - Features principales con iconos
   - Comparativa de planes (FREE/BASIC/PRO)
   - Testimonios de clientes
   - FAQ
   - CTA: "Prueba gratis 7 días"

2. **Pricing** (`/pricing`)
   - Tabla comparativa detallada
   - Toggle anual/mensual (15% descuento anual)
   - Calculadora de comisiones (plan FREE)
   - CTA por cada plan

3. **Features** (`/features`)
   - Beach Service (diferencial)
   - Waiter Calls
   - Multi-idioma
   - Analytics
   - QR Codes
   - Personalización

**Componentes a crear:**
- Hero section con animaciones
- Feature cards
- Pricing table
- Testimonial carousel
- FAQ accordion
- Newsletter signup
- Footer completo

**Diseño:**
- Inspiración: storekit.com (limpio, moderno)
- Colores: Verde + Amarillo
- Tipografía: Inter o similar (Google Fonts)
- Animaciones sutiles (framer-motion)
- Responsive mobile-first

---

### **FASE 2: Autenticación** (30% → 40%)

**Páginas:**
1. **Login** (`/login`)
   - Email + Password
   - "Recordar sesión"
   - "Olvidé mi contraseña"
   - Link a Register
   - Social login futuro (Google)

2. **Register** (`/register`)
   - Datos del restaurante:
     - Nombre del restaurante
     - Slug único (validación en tiempo real)
     - Email
     - Contraseña
     - Teléfono
   - Selección de plan (FREE/BASIC/PRO)
   - Términos y condiciones
   - Confirmación por email

3. **Forgot Password** (`/forgot-password`)
4. **Reset Password** (`/reset-password`)

**Features:**
- Validación de formularios (react-hook-form + zod)
- Error handling visual
- Loading states
- Redirect automático después del login
- Session persistence

**Server Actions:**
- `signIn(email, password)`
- `signUp(restaurantData)`
- `signOut()`
- `resetPassword(email)`

---

### **FASE 3: Dashboard del Restaurante** (40% → 55%)

**Layout:** `/dashboard`

**Sidebar:**
- Logo MyDigitable
- Navegación:
  - 📊 Overview
  - 🍽️ Menú
  - 📦 Pedidos
  - 📍 Mesas/Ubicaciones
  - 🔔 Llamadas de camareros
  - ⚙️ Configuración
  - 💳 Facturación
- Selector de idioma
- Logout

**Páginas del Dashboard:**

1. **Overview** (`/dashboard`)
   - Cards con métricas:
     - Pedidos hoy
     - Ingresos hoy
     - Producto más vendido
     - Tasa de conversión
   - Gráfico de ventas (últimos 7 días)
   - Últimos 5 pedidos
   - Acciones rápidas

2. **Menú - Categorías** (`/dashboard/menu`)
   - Lista de categorías (drag & drop para ordenar)
   - CRUD categorías:
     - Crear nueva
     - Editar (modal)
     - Eliminar (soft delete)
     - Activar/Desactivar
   - Traducciones inline (según plan)

3. **Menú - Productos** (`/dashboard/menu/products`)
   - Lista de productos por categoría
   - Filtros: Categoría, Disponibilidad, Búsqueda
   - CRUD productos:
     - Crear (modal con tabs: Info, Precio, Imagen, Traducciones)
     - Editar
     - Duplicar
     - Eliminar (soft delete)
     - Toggle disponibilidad
   - Upload de imágenes (Supabase Storage)
   - Drag & drop para ordenar

4. **Pedidos** (`/dashboard/orders`)
   - Lista con filtros:
     - Hoy/Semana/Mes/Rango
     - Estado (pending, confirmed, etc.)
     - Tipo (dine-in, delivery, etc.)
   - Vista de detalle del pedido
   - Cambiar estado
   - Imprimir/Descargar

5. **Mesas** (`/dashboard/tables`)
   - Grid de mesas
   - CRUD mesas:
     - Crear (número, capacidad)
     - Generar QR code
     - Descargar QR individual/todas
   - Vista de ocupación (futuro)

6. **Ubicaciones de Playa** (`/dashboard/beach`) - Solo PRO
   - Similar a mesas pero para beach service
   - Mapa visual de las ubicaciones
   - QR codes por hamaca/sombrilla

7. **Llamadas de Camareros** (`/dashboard/waiter-calls`)
   - Lista en tiempo real
   - Ordenadas por prioridad
   - Botón "Resolver"
   - Filtros por tipo/estado
   - Notificaciones push (futuro)

8. **Configuración** (`/dashboard/settings`)
   - Tabs:
     - General (nombre, slug, contacto)
     - Modos activos (dine-in, delivery, etc.)
     - Personalización (tema, colores)
     - Idiomas soportados
     - Horarios
     - Delivery settings
   - Preview del menú público
   - Validaciones según plan

9. **Facturación** (`/dashboard/billing`)
   - Plan actual
   - Uso del mes (si plan FREE: comisiones)
   - Historial de facturas
   - Método de pago (Stripe)
   - Upgrade/Downgrade
   - Cancelar suscripción

**Componentes a crear:**
- DashboardLayout con sidebar
- StatCard (métricas)
- DataTable reutilizable
- Modal genérico
- Form components
- ImageUploader
- QRCodeGenerator
- StatusBadge
- OrderCard
- CategoryCard
- ProductCard

---

### **FASE 4: Menú Público** (55% → 70%)

**URL:** `/r/[slug]` (ej: `/r/la-terraza`)

**Features principales:**

1. **Vista de Menú:**
   - Header con logo del restaurante
   - Selector de idioma
   - Navegación por categorías (sticky)
   - Grid de productos con:
     - Imagen
     - Nombre
     - Descripción
     - Precio
     - Iconos: 🌱 vegetariano, 🌾 sin gluten, etc.
     - Botón "+ Añadir"
   - Búsqueda de productos
   - Filtros: Vegetariano, Vegano, Sin gluten

2. **Carrito (Zustand):**
   - FloatingCartButton (muestra cantidad)
   - CartDrawer (slide from right):
     - Lista de items
     - Editar cantidad (+/-)
     - Eliminar item
     - Subtotal
     - Delivery fee (si aplica)
     - Total
     - Botón "Ir a Checkout"
   - Persistencia en localStorage

3. **Selector de Modo de Pedido:**
   - Modal al abrir el menú:
     - Dine-In → Escanear QR mesa
     - Beach Service → Escanear QR ubicación
     - Delivery → Ingresar dirección
     - Takeaway → Confirmar recogida
   - Guardar selección en session

4. **Waiter Call Button:**
   - Floating button (solo dine-in/beach)
   - Modal con opciones:
     - Asistencia
     - Pedir cuenta
     - Queja
     - Urgente
   - Confirmación

5. **Temas Dinámicos:**
   - Aplicar theme del restaurante
   - Override de colores primary/secondary
   - Transición suave entre temas

**Páginas:**
- `/r/[slug]` - Menú principal
- `/r/[slug]/checkout` - Finalizar pedido

**SEO:**
- Meta tags dinámicos por restaurante
- OpenGraph para compartir
- Schema.org para restaurantes

---

### **FASE 5: Checkout & Pedidos** (70% → 80%)

**Página:** `/r/[slug]/checkout`

**Flow:**

1. **Resumen del pedido:**
   - Items seleccionados
   - Subtotal

2. **Datos del cliente:**
   - Nombre
   - Teléfono
   - Email (opcional)
   - Notas especiales

3. **Delivery (si aplica):**
   - Dirección completa
   - Instrucciones de entrega
   - Mapa (Google Maps API - futuro)

4. **Método de pago:**
   - MVP: "Pagar en el sitio" / "Pagar al recibir"
   - Futuro: Stripe checkout

5. **Confirmación:**
   - Crear orden en DB
   - Email de confirmación (placeholders MVP)
   - Página de "Pedido recibido"
   - Número de orden
   - Tiempo estimado

**Server Actions:**
- `createOrder(orderData)`
- `validateAddress(address)` - futuro
- `processPayment(paymentData)` - futuro

**Features:**
- Validación de stock/disponibilidad
- Cálculo automático de delivery fee
- Rate limiting (ya en DB)
- Error handling

---

### **FASE 6: Panel MyDigitable (Super Admin)** (80% → 90%)

**URL:** `/admin` (protegido, solo admin@mydigitable.com)

**Objetivo:** Gestión de toda la plataforma

**Páginas:**

1. **Dashboard Admin:**
   - Total restaurantes activos
   - Total pedidos procesados
   - Ingresos del mes (comisiones + suscripciones)
   - Gráficos de crecimiento

2. **Restaurantes:**
   - Lista de todos los restaurantes
   - Filtros: Plan, Activo/Inactivo, Fecha registro
   - Ver detalles
   - Cambiar plan manualmente
   - Suspender cuenta
   - Login as (impersonate)

3. **Facturación Global:**
   - Comisiones pendientes de cobro (plan FREE)
   - Suscripciones activas
   - Chargebacks
   - Exportar a CSV

4. **Analytics:**
   - MRR (Monthly Recurring Revenue)
   - Churn rate
   - Plan distribution
   - Top restaurantes por ventas

5. **Configuración:**
   - Planes y  precios
   - Features por plan
   - Emails templates
   - Settings globales

**Componentes:**
- AdminLayout (diferente al dashboard)
- Advanced DataTable
- Charts (recharts)
- Export buttons

---

### **FASE 7: Integraciones & Features Pro** (90% → 95%)

**Features a implementar:**

1. **Stripe Integration:**
   - Checkout para planes BASIC/PRO
   - Webhooks para eventos:
     - subscription.created
     - subscription.updated
     - subscription.deleted
     - invoice.paid
     - invoice.payment_failed
   - Gestión de métodos de pago
   - Facturación automática

2. **Email System:**
   - Resend o SendGrid
   - Templates:
     - Bienvenida
     - Confirmación de pedido (cliente)
     - Nuevo pedido (restaurante)
     - Recordatorio de suscripción
     - Reembolso
   - Notificaciones configurables

3. **Notificaciones Push:**
   - Firebase Cloud Messaging
   - Notificaciones para:
     - Nuevo pedido
     - Waiter call
     - Comentarios
   - Configuración por usuario

4. **Custom Domain (PRO):**
   - DNS verification
   - SSL automático (Vercel)
   - Instrucciones para cliente

5. **API Pública (PRO):**
   - REST API para integraciones
   - Webhooks configurables
   - API keys
   - Rate limiting
   - Docs con Swagger

6. **Multi-Ubicaciones (ENTERPRISE):**
   - Gestión de múltiples locales
   - Menú compartido o independiente
   - Pedidos consolidados
   - Analytics por ubicación

---

### **FASE 8: Testing, Deploy & Monitoring** (95% → 100%)

**Testing:**
- Unit tests (Vitest) para utils
- Integration tests para Server Actions
- E2E tests (Playwright) para flows críticos:
  - Register → Create product → Place order
  - Login → Change plan → Billing

**Performance:**
- Lighthouse audit (>90 en todo)
- Optimización de imágenes
- Code splitting
- Caching strategies

**Deploy:**
- Vercel production
- Custom domain mydigitable.com
- Staging environment

**Monitoring:**
- Sentry para error tracking
- Vercel Analytics
- PostHog para product analytics
- Uptime monitoring

**Docs:**
- User guide para restaurantes
- API documentation
- FAQ completo
- Video tutorials

**Legal:**
- Términos y condiciones
- Política de privacidad
- Política de cookies
- Política de reembolso

---

## 🎨 DISEÑO Y UX

**Principios:**
- **Mobile-first:** 80% de usuarios en móvil
- **Velocidad:** Carga <2s
- **Accesibilidad:** WCAG 2.1 AA
- **Claridad:** CTAs obvios, copy directo

**Paleta de colores (Verde + Amarillo):**
```css
--primary: 142 71% 45%     /* Verde bosque */
--accent: 48 96% 53%       /* Amarillo vibrante */
--background: 0 0% 100%    /* Blanco clean para landing */
--text: 0 0% 10%          /* Negro suave */
```

**Componentes clave:**
- Botones con hover states
- Cards con sombras sutiles
- Formularios con validación visual
- Loaders elegantes
- Toasts para notificaciones
- Modals con backdrop

---

## 📊 MÉTRICAS DE ÉXITO

**Lanzamiento (Mes 1-3):**
- 10 restaurantes activos
- 500 pedidos procesados
- €400 MRR

**Crecimiento (Mes 4-6):**
- 50 restaurantes
- 5,000 pedidos/mes
- €2,000 MRR

**Consolidación (Mes 7-12):**
- 200 restaurantes
- 25,000 pedidos/mes
- €10,000 MRR
- Break-even

---

## ⏱️ ESTIMACIÓN DE TIEMPO

**MVP Mínimo (Fases 1-5):** 6-8 semanas  
**MVP Completo (Fases 1-6):** 10-12 semanas  
**Full Product (Fases 1-8):** 16-20 semanas

**Recomendación:** Lanzar después de Fase 5 (menú + pedidos funcionando) y seguir iterando.

---

## 🚀 PRÓXIMO PASO INMEDIATO

**EMPEZAR CON FASE 1: LANDING PAGE**

¿Comenzamos creando la Landing Page profesional con hero, features y pricing table?
