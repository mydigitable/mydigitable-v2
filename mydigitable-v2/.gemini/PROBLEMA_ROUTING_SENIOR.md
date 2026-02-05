# 🚨 PROBLEMA CRÍTICO - ROUTING DEL DASHBOARD
## Documento para Desarrollador Senior

**Prioridad:** CRÍTICA  
**Tiempo estimado:** 2-4 horas  
**Proyecto:** MyDigitable v2 - Next.js 14 App Router

---s

## 📋 PROBLEMA

**Las rutas dentro del grupo `(dashboard)` dan 404, pero las rutas fuera del grupo funcionan.**

### Evidencia:
- ✅ `http://localhost:3001/dashboard-test` → **FUNCIONA**
- ❌ `http://localhost:3001/dashboard/menu/categories` → **404**
- ❌ `http://localhost:3001/dashboard/menu/products` → **404**
- ❌ TODAS las rutas bajo `(dashboard)/*` → **404**

---

## ✅ YA VERIFICADO

1. ✅ Los archivos `page.tsx` SÍ existen en `src/app/(dashboard)/menu/categories/`
2. ✅ El layout se simplificó de 678 líneas a 170 líneas
3. ✅ ESLint está desactivado (`next.config.mjs`)
4. ✅ Middleware está funcionando correctamente
5. ✅ El servidor corre en puerto 3001
6. ✅ Usuario autenticado y tiene restaurante en DB

---

## 🔍 ESTRUCTURA DE ARCHIVOS

```
src/app/
├── (dashboard)/
│   ├── layout.tsx ← SIMPLIFICADO (170 líneas)
│   ├── dashboard/
│   │   └── page.tsx ✅ FUNCIONA
│   ├── menu/
│   │   ├── page.tsx ✅ (creada hoy)
│   │   ├── categories/
│   │   │   └── page.tsx ❌ 404
│   │   ├── products/
│   │   │   └── page.tsx ❌ 404
│   │   └── menus/
│   │       └── page.tsx ❌ 404
│   ├── orders/
│   │   └── page.tsx ❌ 404
│   └── settings/
│       └── page.tsx ❌ 404
└── dashboard-test/
    └── page.tsx ✅ FUNCIONA (fuera del grupo)
```

---

## 🎯 TAREAS PARA EL DESARROLLADOR

### TAREA 1: Verificar compilación completa
```bash
npm run build
```

Revisar si hay errores específicos en las páginas del dashboard.

### TAREA 2: Probar sin el grupo de rutas
Temporalmente mover:
```
src/app/(dashboard)/menu/categories/page.tsx
```
A:
```
src/app/menu-cat-test/page.tsx
```

Ver si `/menu-cat-test` funciona. Si funciona, el problema está en el grupo `(dashboard)`.

### TAREA 3: Verificar configuración de Next.js
Revisar si hay algo en `next.config.mjs` que bloquee grupos de rutas:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};
export default nextConfig;
```

### TAREA 4: Logs del servidor
Activar logs verbosos de Next.js:
```bash
DEBUG=* npm run dev
```

Ver qué rutas detecta Next.js al compilar.

### TAREA 5: Recrear el grupo de rutas
Si nada funciona, eliminar el grupo `(dashboard)` y crear estructura plana:
```
src/app/
├── dashboard/
│   ├── layout.tsx
│   ├── page.tsx
│   └── menu/
│       └── categories/
│           └── page.tsx
```

---

## 🔧 SOLUCIONES INTENTADAS (NO FUNCIONARON)

1. ❌ Limpiar cache `.next`
2. ❌ Reiniciar servidor múltiples veces
3. ❌ Desactivar middleware
4. ❌ Desactivar ESLint
5. ❌ Simplificar layout a mínimo
6. ❌ Crear página de prueba simple

---

## 💡 TEORÍAS DEL PROBLEMA

### Teoría A: Bug de Next.js 14.2.35 con grupos de rutas
**Evidencia:**
- Rutas fuera del grupo funcionan
- Rutas dentro del grupo no

**Solución:** Actualizar a Next.js 15
```bash
npm install next@latest react@latest react-dom@latest
```

### Teoría B: Nombre del grupo `(dashboard)` causa conflicto
**Evidencia:**
- Hay una ruta `/dashboard` y un grupo `(dashboard)`
- Podría causar confusión en el router

**Solución:** Renombrar grupo a `(app)` o `(protected)`
```bash
mv "src/app/(dashboard)" "src/app/(app)"
```

### Teoría C: Layout corrupto cache
**Evidencia:**
- El layout original era muy complejo (678 líneas)
- Probablemente generó cache corrupto

**Solución:** 
```bash
rm -rf .next node_modules/.cache
npm install
npm run dev
```

---

## 📊 INFORMACIÓN TÉCNICA

### Stack:
- Next.js: 14.2.35
- React: 18.3.1
- TypeScript: 5.x
- Supabase SSR: latest
- Windows OS, PowerShell

### Base de Datos:
- Usuario: mariagustina.rod@gmail.com
- ID: 7a75a8e6-7edd-4989-81a0-cf35810f8376
- Restaurante: Existe en tabla `restaurants`

### Archivos Clave:
1. `src/app/(dashboard)/layout.tsx` - Layout simplificado
2. `src/middleware.ts` - Autenticación (funciona)
3. `next.config.mjs` - Configuración básica
4. `src/app/(dashboard)/menu/categories/page.tsx` - Página que da 404

---

## ⏱️ TIMELINE DE DEBUGGING (6 horas)

1. **15:00** - Usuario reporta 404 en todas las páginas
2. **15:30** - Identificado: falta restaurante en BD
3. **16:00** - Restaurante creado, dashboard home funciona
4. **16:30** - Rutas secundarias siguen dando 404
5. **17:00** - Middleware desactivado (no resuelve)
6. **17:30** - Layout simplificado (no resuelve)
7. **18:00** - Confirmado: problema es el grupo `(dashboard)`
8. **18:30** - BLOQUEADO - Necesita desarrollador senior

---

## 🎯 RESULTADO ESPERADO

Que todas estas URLs funcionen:
- http://localhost:3001/dashboard/menu/categories
- http://localhost:3001/dashboard/menu/products
- http://localhost:3001/dashboard/orders
- http://localhost:3001/dashboard/tables
- http://localhost:3001/dashboard/settings

---

## 📝 NOTAS ADICIONALES

- El proyecto estaba funcionando ayer (21/1/2026)
- Hoy se crearon archivos API que fueron eliminados durante debugging
- No se ha tocado la estructura de carpetas original del dashboard
- Todos los `page.tsx` están bien escritos y tienen exports correctos

---

## 🚀 SIGUIENTE PASO RECOMENDADO

**OPCIÓN 1 (Rápida):** Actualizar a Next.js 15
```bash
npm install next@15 react@latest react-dom@latest
rm -rf .next
npm run dev
```

**OPCIÓN 2 (Segura):** Eliminar grupo de rutas
```bash
# Mover todo fuera del grupo
mv src/app/(dashboard)/* src/app/dashboard/
# Actualizar rutas en navegación
```

**OPCIÓN 3 (Nuclear):** Scaffold nuevo proyecto
```bash
npx create-next-app@latest mydigitable-v3
# Migrar solo archivos esenciales
```

---

**Desarrollador asignado:** Por definir  
**Fecha límite:** URGENTE - Hoy  
**Contacto cliente:** María (mariagustina.rod@gmail.com)
