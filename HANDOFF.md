# 🚀 MyDigitable v2 - Developer Handoff

**Fecha de actualización:** 2026-02-15  
**Versión del proyecto:** 2.0  
**Estado:** En desarrollo activo

---

## 📋 Resumen Ejecutivo

**MyDigitable** es una plataforma SaaS multi-tenant para restaurantes que permite crear menús digitales interactivos, gestionar pedidos en tiempo real, y ofrecer una experiencia premium a los clientes a través de códigos QR.

### Características Principales
- ✅ Menús digitales multiidioma (ES/EN)
- ✅ Sistema de pedidos en tiempo real
- ✅ Gestión de mesas y zonas
- ✅ Llamadas al mozo
- ✅ QR codes personalizables
- ✅ Dashboard completo para restaurantes
- ✅ Sistema de staff con roles y permisos
- ✅ Pagos y propinas
- ✅ Temas personalizables

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Animaciones:** Framer Motion
- **Iconos:** Lucide React
- **Formularios:** React Hook Form (en algunas secciones)

### Backend & Base de Datos
- **BaaS:** Supabase
- **Base de datos:** PostgreSQL
- **Autenticación:** Supabase Auth
- **Storage:** Supabase Storage
- **Realtime:** Supabase Realtime Subscriptions

### Herramientas de Desarrollo
- **Package Manager:** npm
- **Linting:** ESLint (Next.js config)
- **Formateo:** Prettier (recomendado)
- **Control de versiones:** Git

---

## 📁 Estructura del Proyecto

```
mydigitable-v2/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── (auth)/            # Rutas de autenticación
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/         # Dashboard del restaurante
│   │   │   ├── menu/          # Gestión de menús
│   │   │   │   ├── menus/     # Gestión de cartas
│   │   │   │   ├── categories/
│   │   │   │   ├── products/
│   │   │   │   └── atelier/   # Panel premium de productos
│   │   │   ├── orders/        # Pedidos
│   │   │   ├── tables/        # Mesas
│   │   │   ├── staff/         # Personal
│   │   │   ├── settings/      # Configuración
│   │   │   ├── qr/            # Códigos QR
│   │   │   ├── waiter-calls/  # Llamadas al mozo
│   │   │   └── productos/     # Biblioteca de productos
│   │   ├── r/[slug]/          # Menú público del cliente
│   │   ├── onboarding/        # Onboarding inicial
│   │   └── api/               # API Routes
│   ├── components/            # Componentes reutilizables
│   │   ├── dashboard/         # Componentes del dashboard
│   │   ├── menu-dashboard/    # Componentes de gestión de menú
│   │   ├── products/          # Componentes de productos
│   │   └── ui/                # Componentes UI genéricos
│   ├── contexts/              # React Contexts
│   │   └── MenuContext.tsx    # Context para gestión de menú
│   ├── lib/                   # Utilidades y configuraciones
│   │   ├── supabase/          # Cliente de Supabase
│   │   ├── utils/             # Funciones utilitarias
│   │   └── constants/         # Constantes del proyecto
│   ├── styles/                # Estilos globales
│   └── types/                 # Tipos de TypeScript
│       └── supabase.ts        # Tipos generados de Supabase
├── supabase/
│   └── migrations/            # Migraciones de base de datos
├── public/                    # Archivos estáticos
├── .env.local                 # Variables de entorno (NO en git)
├── next.config.mjs            # Configuración de Next.js
├── tailwind.config.ts         # Configuración de Tailwind
└── tsconfig.json              # Configuración de TypeScript
```

---

## 🗄️ Esquema de Base de Datos

### Tablas Principales

#### `restaurants`
Información de los restaurantes (multi-tenant)
- `id` (uuid, PK)
- `owner_id` (uuid, FK → auth.users)
- `name`, `slug`, `description`
- `logo_url`, `cover_image_url`
- `primary_color`, `theme`
- `contact_email`, `contact_phone`, `address`
- `social_instagram`, `social_facebook`, etc.
- `onboarding_completed` (boolean)

#### `menus`
Diferentes cartas/menús del restaurante
- `id` (uuid, PK)
- `restaurant_id` (uuid, FK)
- `name`, `description`, `icon`
- `is_active`, `is_default`
- `schedule_enabled`, `schedule_days`, `schedule_start_time`, `schedule_end_time`
- `included_categories` (uuid[])
- `show_prices`, `show_descriptions`, `show_images`

#### `categories`
Categorías de productos
- `id` (uuid, PK)
- `restaurant_id` (uuid, FK)
- `name_es`, `name_en`
- `description_es`, `description_en`
- `icon`, `image_url`
- `is_active`, `sort_order`

#### `products`
Productos del menú
- `id` (uuid, PK)
- `restaurant_id` (uuid, FK)
- `category_id` (uuid, FK)
- `name_es`, `name_en`
- `description_es`, `description_en`
- `price`, `image_url`
- `is_available`, `is_featured`
- `allergens` (text[])
- `dietary_tags` (text[])
- `preparation_time`

#### `tables`
Mesas del restaurante
- `id` (uuid, PK)
- `restaurant_id` (uuid, FK)
- `table_number`, `capacity`
- `zone`, `qr_code`
- `status` (available, occupied, reserved)

#### `orders`
Pedidos de clientes
- `id` (uuid, PK)
- `restaurant_id` (uuid, FK)
- `table_id` (uuid, FK, nullable)
- `customer_name`, `customer_phone`
- `items` (jsonb)
- `total`, `subtotal`, `tax`
- `status` (pending, confirmed, preparing, ready, delivered, cancelled)
- `payment_status`, `payment_method`

#### `waiter_calls`
Llamadas al mozo
- `id` (uuid, PK)
- `restaurant_id` (uuid, FK)
- `table_id` (uuid, FK)
- `reason`, `priority`
- `status` (pending, attended)
- `attended_by` (uuid, FK → restaurant_staff)

#### `restaurant_staff`
Personal del restaurante
- `id` (uuid, PK)
- `restaurant_id` (uuid, FK)
- `user_id` (uuid, FK → auth.users, nullable)
- `name`, `email`, `phone`
- `role` (owner, manager, waiter, kitchen)
- `permissions` (jsonb)
- `pin_code`, `is_active`

---

## 🔑 Variables de Entorno

Crear archivo `.env.local` en la raíz:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Configuración Inicial

### 1. Clonar el repositorio
```bash
git clone <repo-url>
cd mydigitable-v2
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase
```

### 4. Generar tipos de Supabase
```bash
npx supabase gen types typescript --project-id <tu-project-id> > src/types/supabase.ts
```

### 5. Iniciar servidor de desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 📱 Rutas Principales

### Públicas
- `/` - Landing page
- `/login` - Inicio de sesión
- `/register` - Registro de restaurante
- `/r/[slug]` - Menú público del restaurante

### Dashboard (Requiere autenticación)
- `/dashboard` - Inicio del dashboard
- `/dashboard/menu/menus` - Gestión de cartas
- `/dashboard/menu/categories` - Gestión de categorías
- `/dashboard/menu/products` - Gestión de productos
- `/dashboard/productos` - Biblioteca de productos
- `/dashboard/orders` - Pedidos activos
- `/dashboard/tables` - Gestión de mesas
- `/dashboard/staff` - Gestión de personal
- `/dashboard/qr` - Generación de QR codes
- `/dashboard/waiter-calls` - Llamadas al mozo
- `/dashboard/settings` - Configuración general

---

## 🎨 Sistema de Diseño

### Colores Principales
- **Primary:** Verde (definido en `tailwind.config.ts`)
- **Backgrounds:** Slate-50, White
- **Text:** Slate-900 (títulos), Slate-600 (texto)
- **Borders:** Slate-100, Slate-200

### Componentes Reutilizables
- **Sidebar:** `src/components/dashboard/Sidebar.tsx`
- **TopBar:** `src/components/dashboard/TopBar.tsx`
- **ProductCard:** `src/components/products/ProductCard.tsx`
- **MenuContext:** Context global para gestión de menú

### Convenciones de Estilo
- Usar `className` con Tailwind CSS
- Animaciones con Framer Motion
- Iconos de Lucide React
- Bordes redondeados: `rounded-xl`, `rounded-2xl`
- Sombras: `shadow-lg`, `shadow-xl`

---

## 🔐 Autenticación y Seguridad

### Row Level Security (RLS)
Todas las tablas tienen políticas RLS configuradas en Supabase:
- Los restaurantes solo pueden ver/editar sus propios datos
- Verificación de `restaurant_id` en todas las queries
- Políticas específicas por rol de staff

### Middleware
`middleware.ts` protege rutas del dashboard:
- Verifica autenticación
- Redirige a `/login` si no autenticado
- Verifica `onboarding_completed`

---

## 📊 Gestión de Estado

### Context API
- **MenuContext:** Estado global del menú (categorías, productos, restaurante)
  - Ubicación: `src/contexts/MenuContext.tsx`
  - Uso: `const { categories, products, refresh } = useMenu()`

### Estado Local
- `useState` para estado de componentes
- `useEffect` para efectos secundarios
- Supabase client para queries

---

## 🔄 Realtime

### Subscriptions de Supabase
Implementadas en:
- Pedidos (`orders` table)
- Llamadas al mozo (`waiter_calls` table)

Ejemplo:
```typescript
const subscription = supabase
  .channel('orders')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'orders' },
    (payload) => {
      // Manejar cambio
    }
  )
  .subscribe()
```

---

## 🐛 Debugging

### Console Statements
⚠️ **IMPORTANTE:** El proyecto tiene ~119 console statements
- 35 `console.log` (principalmente para debugging)
- 84+ `console.error` (manejo de errores)

**Recomendación:** Implementar sistema de logging centralizado (Sentry, LogRocket)

### Errores Comunes

1. **"Invalid response from server"**
   - Verificar variables de entorno
   - Regenerar tipos de Supabase

2. **"Restaurant not found"**
   - Verificar que el usuario tenga un restaurante asociado
   - Revisar `onboarding_completed`

3. **Build errors**
   - `next.config.mjs` tiene `ignoreBuildErrors: true`
   - Regenerar tipos: `npx supabase gen types...`

---

## 🧪 Testing

⚠️ **Estado actual:** No hay tests implementados

**Recomendaciones:**
- Jest + React Testing Library para unit tests
- Playwright para E2E tests
- Vitest como alternativa moderna

---

## 📦 Build y Deploy

### Build de Producción
```bash
npm run build
```

### Configuración Actual
`next.config.mjs` tiene configuraciones temporales:
```javascript
typescript: {
  ignoreBuildErrors: true,  // ⚠️ Temporal
},
eslint: {
  ignoreDuringBuilds: true, // ⚠️ Temporal
}
```

**⚠️ IMPORTANTE:** Estas configuraciones deben eliminarse antes de producción

### Deploy
- **Recomendado:** Vercel (optimizado para Next.js)
- **Alternativas:** Netlify, Railway, Render

---

## 🔧 Tareas Pendientes

### Alta Prioridad
- [ ] Eliminar `ignoreBuildErrors` y `ignoreDuringBuilds`
- [ ] Arreglar errores de TypeScript
- [ ] Limpiar console statements
- [ ] Implementar sistema de logging

### Media Prioridad
- [ ] Agregar tests unitarios
- [ ] Implementar tests E2E
- [ ] Optimizar queries (evitar N+1)
- [ ] Agregar paginación en listas largas

### Baja Prioridad
- [ ] Mejorar accesibilidad (a11y)
- [ ] Agregar PWA support
- [ ] Implementar i18n completo
- [ ] Agregar analytics

---

## 📚 Recursos Útiles

### Documentación
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

### Comandos Útiles
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Start producción
npm start

# Lint
npm run lint

# Regenerar tipos Supabase
npx supabase gen types typescript --project-id <id> > src/types/supabase.ts
```

---

## 👥 Contacto y Soporte

**Owner:** María  
**Proyecto:** MyDigitable v2  
**Última actualización:** 2026-02-15

---

## 📝 Notas Adicionales

### Cambios Recientes (2026-02-15)
- ✅ Implementado menú desplegable "Mi Menú" en sidebar
- ✅ 4 subpestañas: Gestión de Menús, Categorías, Productos, Biblioteca
- ✅ Página de gestión de menús completa con toggle, editar, borrar
- ✅ Sistema de cartas con programación de horarios

### Conocimientos Importantes
1. **Multi-tenant:** Cada restaurante es independiente (filtrar por `restaurant_id`)
2. **Multiidioma:** Campos `_es` y `_en` en categorías y productos
3. **Menús programables:** Sistema de horarios automáticos
4. **RLS activo:** Todas las queries deben respetar políticas de seguridad

### Arquitectura de Menús
- **Menus:** Diferentes cartas (ej: "Solo Bebidas", "Carta Completa")
- **Categories:** Agrupaciones de productos
- **Products:** Items individuales del menú
- **Biblioteca:** Productos reutilizables entre categorías

---

**¡Bienvenido al equipo! 🚀**

Si tienes dudas, revisa los artifacts en `.gemini/antigravity/brain/` para más documentación detallada.
