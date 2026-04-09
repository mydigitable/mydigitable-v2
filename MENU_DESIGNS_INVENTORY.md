# INVENTARIO DE DISEÑOS DE MENÚ
_Generado el 2026-04-09 · Proyecto: mydigitable-v2_

---

## ÍNDICE

1. [Menú Público Real](#1-menú-público-real)
2. [Menú Público Demo / Sistema Nuevo](#2-menú-público-demo--sistema-nuevo)
3. [Previews del Dashboard](#3-previews-del-dashboard)
4. [Componentes de Selección de Tema](#4-componentes-de-selección-de-tema)
5. [Sistema de Definición de Temas](#5-sistema-de-definición-de-temas)
6. [Resumen de Estado](#6-resumen-de-estado)
7. [RECOMENDACIÓN](#recomendación)

---

## 1. Menú Público Real

### 1.1 `page.tsx` — Servidor
**Ruta:** `src/app/r/[slug]/page.tsx`
**URL pública:** `/r/{slug}`

**Qué hace:**
Server component. Hace todas las queries a Supabase y arma los datos antes de pasarlos al cliente.

**Queries Supabase:**
- `restaurants` → por slug
- `restaurant_design_config` con `selected_theme:menu_themes(*)` → tema activo + colores custom
- `menus` con categorías y productos anidados → solo activos y visibles
- `product_extra_groups` + `product_extras` → modificadores de producto
- `daily_menus` → platos del día

**Cómo aplica el tema:**
Lee `restaurant_design_config.selected_theme` (relación a `menu_themes`) + `custom_colors` como overrides. Construye el objeto `DesignTheme` con colores, fuentes y flags de visibilidad y se lo pasa a `MenuClient`.

**Estado:** ACTIVO — es la entrada del menú público real.

---

### 1.2 `MenuClient.tsx` — Cliente
**Ruta:** `src/app/r/[slug]/MenuClient.tsx`
**941 líneas**

**Qué hace:**
Client component principal. Renderiza todo lo que ve el cliente del restaurante.

**Layout:**
- Header sticky con logo, nombre del restaurante, buscador y filtros dietéticos
- Pills de categoría con scroll horizontal
- Sección de menús del día (si hay)
- Grid o lista de productos con imágenes, descripción, precio
- Badges de etiquetas dietéticas (vegano, vegetariano, sin gluten, etc.)
- Botón de carrito flotante con total
- Controles de cantidad (+/-)

**Modales incluidos:**
- `ProductDetailModal` — detalle con extras/modificadores seleccionables
- `CartModal` — carrito con resumen y checkout
- `DietaryModal` — filtros de dieta
- `DailyMenuModal` — menú del día expandido
- `CheckoutModal` — flujo de pedido

**Cómo aplica el tema:**
Dos modos según si hay `designTheme`:
- **Modo DB** (cuando `designTheme !== null`): usa `makeInlineTheme()` que convierte los colores de la DB en un objeto de estilos inline. Todos los elementos usan `style={{ color: c.primary }}` etc.
- **Modo Fallback Tailwind** (cuando `designTheme === null`): usa clases predefinidas de `r/[slug]/types.ts` (temas: classic, midnight, neon, ocean, minimal).

**Tipografía:**
Lee `designTheme.fonts.heading` y `designTheme.fonts.body` desde la DB. Carga Google Fonts en `<head>`.

**Visibilidad configurable via `designTheme.config`:**
`show_search`, `show_categories`, `show_images`, `show_prices`, `show_descriptions`, `show_badges`, `show_allergens`, `show_logo`

**Layouts de producto disponibles:**
`grid`, `photo-grid`, `horizontal`, `list` — configurables por categoría.

**Estado:** ACTIVO — es el renderizador principal del menú público.

---

## 2. Menú Público Demo / Sistema Nuevo

### 2.1 `page.tsx` — Tema Demo
**Ruta:** `src/app/(public)/[slug]/page.tsx`
**URL pública:** `/{slug}` (sin `/r/`)

**Qué hace:**
Server component que carga el restaurante y aplica el tema, pero **NO muestra productos reales**. Muestra una página de demostración del tema con 4 productos hardcodeados ("Avocado Toast", "Salmon Bowl", "Burger Clásica", "Pasta Carbonara") y un panel informativo con los colores y fuentes activos.

**Cómo aplica el tema:**
Usa el **sistema nuevo** (`src/lib/theme/`):
- Lee `restaurant.theme_id` (columna directa en la tabla `restaurants`)
- Llama a `getThemeById(restaurant.theme_id)` → definición local del tema
- Llama a `buildCSSVariables(theme, overrides)` → objeto de CSS vars
- Aplica como `style={cssVars}` en el div raíz

**Lee de `restaurants`:**
`theme_id`, `theme_primary_color`, `theme_font`, `theme_font_size`

**Problema crítico:**
El Design Studio guarda el tema en `restaurant_design_config.selected_theme_id` (tabla separada). Esta página lee de `restaurants.theme_id`. **Nunca se sincronizan.** Cuando el dueño cambia el tema en el Design Studio, esta página no lo refleja.

**Estado:** ACTIVO como ruta (Next.js la sirve), pero **NO funcional como menú** — sin productos reales, sin carrito, sin interactividad. Es un prototipo incompleto del sistema nuevo.

---

## 3. Previews del Dashboard

### 3.1 `MenuMobilePreview.tsx` — Preview compartida
**Ruta:** `src/components/shared/MenuMobilePreview.tsx`
**558 líneas**

**Qué hace:**
Renderiza una vista previa móvil del menú para uso interno en el dashboard (no es la página pública). Se usa en tres lugares.

**Dónde se usa:**
1. `src/app/dashboard/menu/layout.tsx` — sidebar de preview global (visible en todas las páginas del dashboard excepto `/design`)
2. `src/app/dashboard/menu/design/components/DesignStudio.tsx` — preview central del Design Studio
3. `src/app/dashboard/menu/menus/[id]/MenuWizard.tsx` — preview en el wizard de creación de menú

**Layout:**
Marco de iPhone (375×812px con notch), escalado al 82% en el sidebar del layout.

**5 renderizaciones por tema (branches condicionales):**

| Rama | Tema | Cómo se ve |
|------|------|-----------|
| `isDark` | craft-bold | Fondo casi negro, texto cobre/bronce, lista numerada, estilo industrial |
| `isBistro` | classic-bistro | Header navy, tipografía serif Playfair, cards elegantes con borde fino |
| `isNordic` | nordic-clean | Minimalista, sin sombras, bordes muy claros, botones pill negros |
| `isRustic` | warm-rustic | Fondo papel cálido, cards con imagen lateral, badges itálicos |
| Default | modern-minimal | Grid/lista estándar, verde primario, cards redondeadas |

**Cómo determina el tema:**
Lee `designConfig.selected_theme?.slug` y hace comparación de string. No usa el sistema `src/lib/theme/`.

**Tipos de layout de producto:**
`grid` (2 columnas), `photo-grid` (imagen cuadrada), `horizontal` (scroll), `list` (columna)

**Estado:** ACTIVO — es la preview más usada del proyecto (3 importaciones).

---

### 3.2 `MobilePreview.tsx` — Preview del Design Studio (design/components)
**Ruta:** `src/app/dashboard/menu/design/components/MobilePreview.tsx`
**613 líneas**

**Qué hace:**
Preview móvil moderna para el Design Studio. Marco de iPhone 14 (430×880px con Dynamic Island). Lee los colores directamente de `config.custom_colors` y `config.selected_theme.colors` via CSS variables.

**Layout:**
- Status bar con hora (9:41) y señal/batería
- Header simple (burger icon + logo + carrito con badge)
- Search bar (si `config.show_search`)
- Tabs de menús múltiples (si hay más de uno)
- Pills de categorías (si `config.show_categories`)
- Sección "Destacados" con banner de imagen grande
- Grid (2 col) o lista de productos por categoría
- FAB de carrito sticky ("Ver pedido · €33.40")
- "Powered by MyDigitable" (si `config.show_powered_by`)

**Incluye dos sub-componentes internos:**
- `ProductCardGrid` — card cuadrada con imagen, nombre, precio, botón "+"
- `ProductCardList` — fila horizontal con thumbnail 96×96px, nombre, descripción, precio

**Cómo aplica tema:**
CSS variables inline: `--color-primary`, `--color-background`, `--color-surface`, `--color-border`, `--color-text`, `--color-text-secondary`, `--color-accent`. Lee Google Fonts del tema activo.

**PROBLEMA:** No es importado por `DesignStudio.tsx`. El Design Studio usa `MenuMobilePreview` (la compartida de `src/components/shared/`), no este componente.

**Dónde se usa:** **NINGÚN LUGAR** — está definido pero no hay ninguna importación activa.

**Estado:** HUÉRFANO — código muerto. Posiblemente era el plan para reemplazar `MenuMobilePreview` en el Design Studio pero nunca se conectó.

---

### 3.3 `MenuPreview.tsx` — Preview de escritorio
**Ruta:** `src/app/dashboard/menu/design/components/MenuPreview.tsx`
**~530 líneas**

**Qué hace:**
Preview del menú en marco iPhone 390×844px. A diferencia de los otros, implementa **5 estilos de header** y **5 estilos de categorías** distintos, lo que lo hace el componente visualmente más rico del proyecto.

**5 estilos de header:**
| Header | Descripción visual |
|--------|--------------------|
| `simple` | Barra blanca con hamburger + nombre + carrito |
| `hero` | Fondo color primario, nombre centrado en blanco, separador dorado |
| `industrial` | Nombre en mayúsculas tracking amplio, línea degradada abajo |
| `editorial` | Nombre en serif grande peso light, separadores finos, search en header |
| `ornamental` | Nombre serif grande, línea decorativa con ✦, tagline en itálica |

**5 estilos de categorías:**
| Estilo | Descripción visual |
|--------|-------------------|
| `pills` | Botones pill con relleno color primario |
| `tabs` | Tabs con underline color primario |
| `tags` | Botones cuadrados con borde, tracking amplio |
| `underline` | Solo underline fino, peso light |
| `italic-tags` | Tags con texto serif en itálica para inactivos |

**Shapes de card:** `sharp` (2px), `square` (4px), `rounded` (variable), `soft` (5px), `borderless` (0px)

**Spacing:** `compact` (8px gap), `normal` (16px), `relaxed` (24px)

**Featured banner:** Estilo `dark-banner` con imagen grande y badge "Plato de la Casa"

**Usa productos reales** (si los hay) o cae a 6 productos placeholder.

**Cómo aplica tema:**
CSS variables inline desde `config.custom_colors` + `selected_theme.colors`.

**Dónde se usa:** **NINGÚN LUGAR** — `export function MenuPreview` está definida pero no hay ningún `import { MenuPreview }` en todo el proyecto.

**Estado:** HUÉRFANO — código muerto. Es el componente visualmente más avanzado del proyecto y está completamente desconectado.

---

### 3.4 `MobilePreview.tsx` — Preview del Atelier
**Ruta:** `src/app/dashboard/menu/atelier/MobilePreview.tsx`
**212 líneas**

**Qué hace:**
Preview minimalista para el módulo "Atelier" (creación/edición avanzada de menú). Panel lateral de 280px de ancho, no es un marco de iPhone realista.

**Layout:**
- Título "Vista del cliente" (label pequeño)
- Teléfono con borde negro grueso, aspect-ratio 9:19.5
- Muestra la categoría seleccionada con sus productos disponibles
- Cada producto: thumbnail 64×64px, labels dietéticos (emoji), nombre, descripción (2 líneas), alérgenos (emoji), precio en verde
- Stats card: conteo de categorías / productos / estado activo

**Diseño fijo:**
No implementa temas. Usa colores hardcodeados vía CSS variables del atelier (`--atelier-surface`, `--atelier-ink`, `--atelier-accent`) y verde `#2B4D35` para el precio.

**Dónde se usa:**
`src/app/dashboard/menu/atelier/Scene2MenuBuilder.tsx` (única importación).

**Estado:** ACTIVO — funcional dentro del módulo Atelier.

---

## 4. Componentes de Selección de Tema

### 4.1 `ThemePreviewCard.tsx`
**Ruta:** `src/components/theme/ThemePreviewCard.tsx`
**224 líneas**

**Qué hace:**
Card individual de preview de tema. Renderiza una mini vista de teléfono (aspect 9:16, max 200px de alto) con el tema aplicado.

**Contenido visual de la card:**
- Mini header con nombre del restaurante ("MYDIGITABLE")
- Barra de búsqueda simulada
- Pills de categoría ("All", "Starters", "Mains")
- Grid 2×1 de cards de producto mini (7px de fuente)
- FAB del carrito mini ("🛒 VIEW CART")
- Bajo la imagen: nombre del tema, descripción, target, punto de color

**Aplica:** Tokens directamente de `ThemeDefinition.tokens` (sistema `src/lib/theme/`).

**Dónde se usa:** `src/components/theme/ThemeSelector.tsx`

**Estado:** ACTIVO — dentro del flujo del sistema nuevo.

---

### 4.2 `ThemeSelector.tsx` (sistema nuevo)
**Ruta:** `src/components/theme/ThemeSelector.tsx`
**87 líneas**

**Qué hace:**
Grid de `ThemePreviewCard` + panel de personalización. Al seleccionar un tema llama a `applyThemeToDocument()` (solo DOM, sin persistencia en Supabase).

**Problema:** No guarda nada. Si el usuario recarga, el tema seleccionado desaparece.

**Dónde se usa:** No aparece importado en ningún archivo activo del proyecto (huérfano probable).

**Estado:** POSIBLEMENTE HUÉRFANO — no se encontraron importaciones activas.

---

### 4.3 `ThemeCustomizer.tsx`
**Ruta:** `src/components/theme/ThemeCustomizer.tsx`
**127 líneas**

**Qué hace:**
Panel de personalización: 8 colores preset + picker custom, dropdown de fuente, 3 tamaños de texto.

**Dónde se usa:** `src/components/theme/ThemeSelector.tsx`

**Estado:** ACTIVO dentro del sistema nuevo, pero solo si `ThemeSelector` se usa.

---

## 5. Sistema de Definición de Temas

### 5.1 `themes.ts`
**Ruta:** `src/lib/theme/themes.ts`

**Qué hace:**
Define los 5 temas base del sistema NUEVO. Fuente de verdad de tokens visuales.

**Los 5 temas:**

| ID | Nombre | Color Primario | Tipografía | Target |
|----|--------|---------------|-----------|--------|
| `modern-minimal` | Modern Minimal | Verde `#16A34A` (green-600) | DM Sans | Cafeterías, brunch, healthy |
| `classic-bistro` | Classic Bistro | Azul marino `#1E3A8A` (blue-900) | Playfair Display + Lato | Bistros, fine casual |
| `craft-bold` | Craft & Bold | Cobre `#C27831` | Bebas Neue + Barlow | Craft bars, burgers, BBQ |
| `nordic-clean` | Nordic Clean | Neutro `#525252` (neutral-600) | Cormorant Garamond + Outfit | Cafés nórdicos, bowls |
| `warm-rustic` | Warm Rustic | Ámbar `#B45309` (amber-700) | Libre Baskerville + Source Sans 3 | Italianos, tabernas, tapas |

**Cada tema incluye:**
- 8 colores (primary, primaryText, background, surface, border, text, textSecondary, textMuted)
- 3 fuentes (heading, body, price)
- 4 radios de borde
- 3 sombras
- 6 tokens semánticos (header bg/text, category active bg/text, cart bg/text)
- Flags de customización (allowPrimaryColor, allowFont, allowFontSize, availableFonts)

**Dónde se usa:** `src/lib/theme/apply-theme.ts`, `src/components/theme/ThemeSelector.tsx`, `src/components/theme/ThemeCustomizer.tsx`, `src/app/(public)/[slug]/page.tsx`

**Estado:** ACTIVO — pero solo en el sistema nuevo (no en `/r/[slug]`, que es donde está el menú real).

---

### 5.2 `apply-theme.ts`
**Ruta:** `src/lib/theme/apply-theme.ts`

**Qué hace:**
Traduce un `ThemeDefinition` a CSS variables. Tres funciones:
- `applyThemeToDocument(themeId, overrides?)` — aplica al DOM (client-side)
- `applyTokens(root, theme, overrides?)` — escribe variables en un elemento
- `buildCSSVariables(theme, overrides?)` — retorna objeto para SSR (`style={cssVars}`)

**20 CSS variables que genera:**
`--color-primary`, `--color-primary-text`, `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, `--color-text-secondary`, `--color-text-muted`, `--font-heading`, `--font-body`, `--font-price`, `--font-size-base`, `--radius-sm/md/lg/full`, `--shadow-sm/md/lg`, `--header-bg`, `--header-text`, `--category-active-bg/text`, `--cart-bg/text`

**Estado:** ACTIVO en el sistema nuevo.

---

### 5.3 `types.ts`
**Ruta:** `src/lib/theme/types.ts`

**Qué hace:**
Tipos TypeScript del sistema nuevo: `ThemeTokens`, `ThemeDefinition`, `ThemeOverrides`, `ThemeFontSize`, `ThemeFont`.

**Estado:** ACTIVO en el sistema nuevo.

---

## 6. Resumen de Estado

| # | Archivo | Tipo | Estado | Productos reales | Tema desde |
|---|---------|------|--------|-----------------|-----------|
| 1 | `r/[slug]/page.tsx` | Página pública | ✅ ACTIVO | ✅ Sí | DB (`restaurant_design_config`) |
| 2 | `r/[slug]/MenuClient.tsx` | Renderizador | ✅ ACTIVO | ✅ Sí | DB via `makeInlineTheme()` |
| 3 | `(public)/[slug]/page.tsx` | Página pública | ⚠️ ACTIVO ROTO | ❌ No (4 hardcoded) | `src/lib/theme/` |
| 4 | `components/shared/MenuMobilePreview.tsx` | Preview dashboard | ✅ ACTIVO (×3) | ✅ Sí | DB via branches condicionales |
| 5 | `design/components/MobilePreview.tsx` | Preview dashboard | ❌ HUÉRFANO | ✅ Sí | DB via CSS vars |
| 6 | `design/components/MenuPreview.tsx` | Preview dashboard | ❌ HUÉRFANO | ✅ Sí | DB via CSS vars |
| 7 | `atelier/MobilePreview.tsx` | Preview atelier | ✅ ACTIVO (×1) | ✅ Sí | Hardcoded (sin temas) |
| 8 | `components/theme/ThemePreviewCard.tsx` | UI selector | ✅ ACTIVO | ❌ (demo) | `src/lib/theme/` |
| 9 | `components/theme/ThemeSelector.tsx` | UI selector | ⚠️ POSIBLE HUÉRFANO | — | `src/lib/theme/` |
| 10 | `components/theme/ThemeCustomizer.tsx` | UI selector | ⚠️ POSIBLE HUÉRFANO | — | `src/lib/theme/` |
| 11 | `lib/theme/themes.ts` | Definiciones | ✅ ACTIVO | — | — (es la fuente) |
| 12 | `lib/theme/apply-theme.ts` | Utilidad | ✅ ACTIVO (sistema nuevo) | — | — |
| 13 | `lib/theme/types.ts` | Tipos | ✅ ACTIVO (sistema nuevo) | — | — |

**Huérfanos confirmados:**
- `design/components/MobilePreview.tsx` — 613 líneas, cero importaciones
- `design/components/MenuPreview.tsx` — ~530 líneas, cero importaciones

**Conflicto de fuentes de verdad:**
- El sistema viejo (`r/[slug]`) lee el tema de la tabla `menu_themes` via `restaurant_design_config`
- El sistema nuevo (`(public)/[slug]`) lee el tema de columnas directas en `restaurants` (`theme_id`, `theme_primary_color`)
- Ninguno sincroniza con el otro
- El Design Studio solo escribe en `restaurant_design_config` → solo afecta el sistema viejo

---

## RECOMENDACIÓN

### Diseño más completo y funcional hoy: `r/[slug]/MenuClient.tsx`

**Por qué es el ganador:**
1. **Único con productos reales** — todos los demás previews usan datos mock o solo muestran la estructura
2. **El más completo en features** — carrito, extras, modificadores, filtros dietéticos, búsqueda, alérgenos, menús del día, modales
3. **Conectado al sistema de temas real** — lee de `restaurant_design_config` + `menu_themes`, que es donde el Design Studio guarda los cambios
4. **941 líneas bien estructuradas** — separación clara entre lógica y renderizado, dos modos (DB theme / Tailwind fallback)
5. **En producción activa** — es la URL que se le da al cliente del restaurante (`/r/{slug}`)

**Sus debilidades actuales:**
- Usa un sistema de temas propio (`makeInlineTheme()`) en lugar del sistema unificado `src/lib/theme/`
- Los temas fallback en `r/[slug]/types.ts` son diferentes a los 5 temas de `src/lib/theme/themes.ts`
- `MenuMobilePreview.tsx` (la preview del dashboard) reproduce el mismo renderizado con 5 branches condicionales por tema — duplicación de lógica

**Lo que habría que hacer con él:**
Migrar `MenuClient.tsx` para que use `buildCSSVariables()` de `src/lib/theme/apply-theme.ts` en lugar de `makeInlineTheme()`, y eliminar los temas fallback de `types.ts`. Eso unificaría ambos sistemas manteniendo el menú real funcionando.

**Candidato a eliminar:**
`(public)/[slug]/page.tsx` — ruta activa que devuelve un menú falso. Debería ser un redirect a `/r/{slug}` o eliminarse. Tal como está, cualquier usuario que llegue a `/{slug}` ve un menú demo sin productos reales, lo cual es peor que un 404.

**Candidatos a eliminar (código muerto):**
- `design/components/MobilePreview.tsx` — 613 líneas sin uso
- `design/components/MenuPreview.tsx` — ~530 líneas sin uso (pero contiene los 5 estilos de header más avanzados del proyecto — considerar rescatarlo e integrarlo en DesignStudio antes de borrar)
