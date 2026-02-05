# 📋 RESUMEN EJECUTIVO - PROYECTO MYDIGITABLE

**Fecha:** Enero 2026
**Estado:** Reconstrucción en progreso

---

## 🎯 QUÉ ES MYDIGITABLE

**MyDigitable** es una plataforma SaaS de menú digital para restaurantes. Permite a los restaurantes tener su propio menú online donde los clientes pueden ver productos y hacer pedidos.

**Modelo de negocio:** Suscripción mensual (sin comisiones por pedido)

**Target inicial:** Restaurantes pequeños en España (bares de tapas, cafeterías, restaurantes familiares)

---

## 🏗️ DECISIÓN TÉCNICA TOMADA

### Problema anterior
El proyecto original tenía:
- ~28,000 líneas de código
- Prisma + Supabase (duplicación de ORM)
- Sistema de traducciones polimórfico complejo
- 100+ archivos
- Muchos errores y código roto
- Complejidad prematura para un MVP

### Solución elegida
**Reconstruir desde cero** con arquitectura simple pero escalable:
- ~20 archivos
- Solo Supabase (sin Prisma)
- Traducciones inline en las tablas
- Sistema de temas con CSS variables
- i18n preparado pero simple

---

## 🛠️ STACK TECNOLÓGICO (NUEVO)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 14 | Framework (App Router) |
| React | 18 | UI |
| TypeScript | 5 | Tipado |
| Supabase | Latest | BD + Auth + Realtime |
| TailwindCSS | 3.4 | Estilos |
| Zustand | 4.5 | Estado global (carrito) |
| Lucide React | Latest | Iconos |

---

## 📁 ESTRUCTURA DEL PROYECTO NUEVO

```
MyDigitable-v2/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── menu/page.tsx
│   │   │   │   └── orders/page.tsx
│   │   │   └── layout.tsx
│   │   ├── r/[slug]/
│   │   │   ├── page.tsx (menú público)
│   │   │   └── checkout/page.tsx
│   │   ├── api/auth/callback/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx (landing)
│   ├── components/
│   │   ├── ui/ (button, card, input, loading)
│   │   ├── menu/ (product-card, category-nav, cart-button, cart-drawer)
│   │   └── dashboard/ (sidebar)
│   ├── lib/
│   │   ├── supabase/ (client.ts, server.ts)
│   │   ├── store/ (cart-store.ts)
│   │   ├── i18n/ (config, dictionaries/es.json, en.json)
│   │   ├── themes/ (config.ts)
│   │   └── utils.ts
│   ├── types/
│   │   └── database.ts
│   └── middleware.ts
├── .env.local
├── tailwind.config.ts
└── package.json
```

---

## 🗄️ BASE DE DATOS (SUPABASE)

### Tablas principales

**restaurants**
- id, owner_id, name, slug, description, logo_url
- phone, email, address
- theme, default_locale, supported_locales
- is_active, created_at, updated_at

**categories**
- id, restaurant_id, sort_order, is_active
- name_es, name_en (traducciones inline)

**products**
- id, restaurant_id, category_id, price, image_url
- is_available, sort_order
- name_es, name_en, description_es, description_en (traducciones inline)

**orders**
- id, restaurant_id, order_number, status, total
- customer_name, customer_phone, customer_email, notes
- created_at

**order_items**
- id, order_id, product_id
- product_name, product_price, quantity (snapshot)

### Conexión
```
URL: https://rimigtkaowxbhtluiito.supabase.co
```

---

## 🎨 SISTEMA DE DISEÑO

### Paleta de colores (tema por defecto)
| Nombre | Valor HSL | Uso |
|--------|-----------|-----|
| Background | 160 45% 6% | Fondo oscuro (verde muy oscuro) |
| Card | 160 40% 10% | Superficies |
| Primary | 142 71% 45% | Verde brillante (acciones) |
| Accent | 48 96% 53% | Amarillo (CTAs destacados) |
| Muted | 160 20% 15% | Elementos secundarios |

### Temas disponibles
1. **default** - Verde Bosque + Amarillo (oscuro)
2. **light** - Versión clara
3. **neon** - Púrpura/cyan neón

### Cómo agregar temas
Solo agregar variables CSS en `globals.css` con clase `.theme-[nombre]`

---

## 🌍 SISTEMA DE IDIOMAS (i18n)

### Idiomas configurados
- **es** (Español) - Por defecto
- **en** (English) - Preparado

### Estructura
```
src/lib/i18n/
├── config.ts (locales disponibles)
├── get-dictionary.ts (carga de diccionarios)
└── dictionaries/
    ├── es.json
    └── en.json
```

### Cómo agregar idiomas
1. Crear archivo `dictionaries/[locale].json`
2. Agregar locale a `config.ts`
3. Agregar columna `name_[locale]` a tablas si necesario

---

## 🔐 AUTENTICACIÓN

- **Proveedor:** Supabase Auth
- **Método:** Email + Password
- **Protección:** Middleware de Next.js
- **Rutas protegidas:** `/dashboard/*`
- **Rutas públicas:** `/`, `/r/*`, `/login`, `/register`

---

## 🛒 CARRITO DE COMPRAS

- **Librería:** Zustand con persistencia
- **Storage:** localStorage (key: `mydigitable-cart`)
- **Funcionalidades:**
  - Agregar/quitar productos
  - Actualizar cantidades
  - Limpiar carrito si cambia de restaurante
  - Calcular totales

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS

| Feature | Estado |
|---------|--------|
| Landing page | ✅ |
| Registro de restaurante | ✅ |
| Login/Logout | ✅ |
| Menú público por slug | ✅ |
| Navegación por categorías | ✅ |
| Carrito de compras | ✅ |
| Dashboard básico | ✅ |
| Sistema de temas | ✅ |
| Sistema i18n | ✅ (estructura) |
| Middleware de auth | ✅ |

---

## ❌ FUNCIONALIDADES PENDIENTES

| Feature | Prioridad |
|---------|-----------|
| CRUD de productos en dashboard | 🔴 Alta |
| Página de checkout completa | 🔴 Alta |
| Gestión de pedidos | 🔴 Alta |
| Integración Stripe | 🟡 Media |
| Notificaciones en tiempo real | 🟡 Media |
| Configuración de restaurante | 🟡 Media |
| Analytics | 🟢 Baja |
| PWA | 🟢 Baja |

---

## 📝 VARIABLES DE ENTORNO

```env
NEXT_PUBLIC_SUPABASE_URL=https://rimigtkaowxbhtluiito.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_aL3P780jOrGgUy93eKHHUA_mR4m4e8P
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Nota:** Stripe y otras integraciones se agregarán después.

---

## 🎯 OBJETIVOS DEL MVP

1. Un restaurante puede registrarse y crear su menú
2. Los clientes pueden ver el menú en `/r/[slug]`
3. Los clientes pueden agregar productos al carrito
4. Los clientes pueden hacer un pedido (sin pago online inicialmente)
5. El restaurante puede ver los pedidos en el dashboard

---

## 📂 ARCHIVOS IMPORTANTES DE REFERENCIA

1. **PROMPT_MAESTRO_MYDIGITABLE_V2.md** - Prompt completo para crear el proyecto
2. **PROYECTO_DOCUMENTADO.md** - Documentación del proyecto anterior
3. **ANALISIS-INTEGRAL-PROYECTO.md** - Auditoría técnica completa

---

## 💡 CONTEXTO PARA LA IA

- La fundadora es programadora web con experiencia en hostelería
- Está en España, target inicial mercado español
- Prefiere código simple y funcional sobre arquitectura compleja
- Usa Cursor como IDE con IA
- El proyecto anterior tenía muchos problemas, este es un fresh start
- Prioridad: que funcione > que sea perfecto

---

## 🚀 SIGUIENTE PASO INMEDIATO

Verificar que el proyecto nuevo compilar y funciona:
1. `npm install`
2. Crear `.env.local` con las 3 variables
3. `npm run dev`
4. Probar rutas básicas

Luego implementar CRUD de productos en el dashboard.

---

**Documento generado:** Enero 2026
**Para uso de:** Asistente IA de desarrollo
