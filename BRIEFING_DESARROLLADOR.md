# MyDigitable - Briefing para Desarrollador

## 🎯 ¿Qué es MyDigitable?

**MyDigitable** es un **SaaS de menús digitales para restaurantes**. Es una plataforma completa que permite a los restaurantes digitalizar su carta, gestionar pedidos en tiempo real, y ofrecer a sus clientes una experiencia de pedido moderna desde el móvil.

---

## 💰 Modelo de Negocio

| Característica | MyDigitable | Competencia |
|----------------|-------------|-------------|
| Comisión por pedido | **0%** | 15-35% |
| Idiomas | 7 idiomas nativos | 1-2 idiomas |
| KDS (Pantalla cocina) | Incluido | Extra €€€ |
| Pedidos grupales | ✅ Incluido | ❌ No existe |

**Planes de suscripción**: Basic, Pro, Enterprise (mensual/anual)

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Estilos**: Tailwind CSS + Framer Motion (animaciones)
- **Backend/DB**: Supabase (PostgreSQL + Auth + Realtime)
- **Iconos**: Lucide React
- **Estado**: Zustand

### Estructura de la Aplicación
```
1. LANDING PAGE (Pública)
   └── Marketing, pricing, registro

2. DASHBOARD (Privado - Dueños de restaurante)
   ├── Home (KPIs, pedidos en tiempo real)
   ├── Menú (Categorías, Productos, Modificadores)
   ├── Pedidos (Activos, Historial)
   ├── Cocina (KDS - Kitchen Display System)
   ├── Mesas (Gestión, QR codes)
   ├── Clientes (CRM básico)
   ├── Analytics (Ventas, productos top)
   ├── Marketing (Cupones, notificaciones)
   ├── Staff (Empleados, roles)
   └── Settings (Configuración general)

3. MENÚ PÚBLICO (Clientes finales)
   └── /r/[slug] → Menú del restaurante
   └── Carrito, pedido, pago
```

---

## 📊 Base de Datos (Supabase)

### Tablas Principales (16 tablas)
```sql
-- Core
restaurants     -- Datos del restaurante
categories      -- Categorías del menú
products        -- Productos/platos
modifiers       -- Modificadores (extras, tamaños)
modifier_groups -- Grupos de modificadores

-- Operaciones
orders          -- Pedidos
order_items     -- Líneas de pedido
tables          -- Mesas del restaurante
waiter_calls    -- Llamadas al camarero

-- Usuarios
customers       -- Clientes finales
staff           -- Personal del restaurante

-- Extras
themes          -- Temas visuales del menú
qr_codes        -- Códigos QR generados
menus           -- Menús configurados
daily_menus     -- Menú del día
```

---

## ✅ Lo que YA está desarrollado

| Módulo | Estado | Notas |
|--------|--------|-------|
| Landing Page | ✅ 100% | Hero 3D, animaciones premium, multi-idioma |
| Auth (Login/Register) | ✅ 95% | Supabase Auth integrado |
| Products CRUD | ✅ 98% | Crear, editar, duplicar, imágenes, alérgenos |
| Modifiers CRUD | ✅ 100% | Grupos jerárquicos completos |
| Dashboard Home | ⚠️ 95% | KPIs, charts (con datos mock) |
| Sidebar Navigation | ✅ 90% | Colapsable, persistente |
| Supabase Schema | ⚠️ 90% | Tablas existen, algunos triggers rotos |

---

## ❌ Lo que FALTA desarrollar

### Prioridad Alta
1. **Menú Público** (`/r/[slug]`)
   - Vista del menú para clientes
   - Carrito de compra
   - Proceso de pedido
   - Integración de pago (Stripe)

2. **Sistema de Pedidos**
   - Recepción en tiempo real (Supabase Realtime)
   - Estados: Pendiente → En preparación → Listo → Entregado
   - Notificaciones push

3. **KDS (Kitchen Display System)**
   - Pantalla para cocina
   - Cola de pedidos
   - Marcar como preparado

### Prioridad Media
4. **Analytics Dashboard**
   - Ventas por período
   - Productos más vendidos
   - Horas punta

5. **Gestión de Mesas**
   - Mapa visual de mesas
   - Generador de QR por mesa
   - Estado de ocupación

6. **CRM Básico**
   - Lista de clientes
   - Historial de pedidos por cliente

### Prioridad Baja
7. **Marketing**
   - Cupones de descuento
   - Notificaciones push

8. **Super Admin Panel**
   - Gestión de todos los restaurantes
   - Facturación y suscripciones

---

## ⚠️ Problema Técnico Actual

El proyecto tiene un problema de **routing en Next.js** con los route groups `(dashboard)`. Las rutas internas devuelven 404 intermitentes.

### Solución Propuesta
Migrar a una **arquitectura plana**:
```
❌ Actual:  src/app/(dashboard)/menu/products/page.tsx
✅ Nuevo:   src/app/dashboard/menu/products/page.tsx
```

---

## 🎨 Diseño Visual

- **Colores**: Verde (#22c55e) como primario, escala Slate para neutros
- **Estilo**: Premium, moderno, glassmorphism sutil
- **Animaciones**: Suaves con Framer Motion
- **Responsive**: Mobile-first (los clientes usan móvil)

---

## 📱 Flujo Principal del Usuario Final

```
1. Cliente escanea QR en la mesa
2. Ve el menú digital del restaurante
3. Añade productos al carrito
4. Personaliza con modificadores (tamaño, extras)
5. Envía pedido
6. Cocina recibe en KDS
7. Cliente recibe notificación cuando está listo
```

---

## 🔗 Recursos

- **Repo**: (este directorio)
- **Supabase**: Proyecto configurado con auth y tablas
- **Figma/Diseño**: El landing actual ES la referencia de diseño

---

## 📞 Contacto

Para dudas sobre el proyecto, consultar los documentos:
- `PLAN_DESARROLLO_COMPLETO.md`
- `RESUMEN_PROYECTO_MYDIGITABLE.md`
- `.gemini/` (historial de desarrollo con IA)
