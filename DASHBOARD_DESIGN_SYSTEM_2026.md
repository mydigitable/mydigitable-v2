# 💎 MyDigitable Dashboard 2026: Design System & Concept

> **Vision**: Transform the functional dashboard into a high-value, high-contrast "Command Center". Moving from "Display Data" to "Drive Decisions".
> **Aesthetic**: European Premium SaaS (Stripe/Linear/Revolut). Deep contrast, elegant typography, purposeful depth.

---

## 1. Sistema de Color ("Deep Contrast")

Abandonamos el gris plano. Introducimos profundidad con una paleta **Zinc/Slate** enriquecida y un sistema semántico vibrante.

### **Base / Estructura**
- **Surface Primary (Canvas)**: `#F8FAFC` (Slate 50) - *No blanco puro, evita fatiga visual.*
- **Surface Card (Elevated)**: `#FFFFFF` (White) - *Para tarjetas, con sombra.*
- **Surface Header (Hero)**: `linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)` - *Sutil degradado vertical para dar peso al top.*
- **Border Subtle**: `#E2E8F0` (Slate 200)
- **Border Focus**: `#CBD5E1` (Slate 300)

### **Tipografía (Jerarquía)**
- **Text Primary (Strong)**: `#0F172A` (Slate 900) - *Casi negro, alto contraste.*
- **Text Secondary (Support)**: `#64748B` (Slate 500) - *Para etiquetas, legible pero suave.*
- **Text Tertiary (Meta)**: `#94A3B8` (Slate 400) - *Iconos inactivos, fechas irrelevantes.*

### **Acentos (Vibrant SaaS)**
- **Brand Primary**: `#4F46E5` (Indigo 600) -> *Acciones principales, crecimiento.*
    - *Gradient*: `linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)`
- **Success (Green)**: `#10B981` (Emerald 500) -> *Ingresos, crecimiento positivo.*
- **Warning (Amber)**: `#F59E0B` (Amber 500) -> *Atención requerida (Stock).*
- **Danger (Rose)**: `#F43F5E` (Rose 500) -> *Errores críticos.*

---

## 2. Escala Tipográfica (Inter / DM Sans)

El secreto del "Look Premium" es el contraste de **peso** y **tamaño**, no solo color.

| Elemento | Tamaño | Peso | Letter Spacing | Uso |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Metric** | `36px` | **800 (ExtraBold)** | `-1.5px` | El número que importa ($1,240). |
| **Section Title** | `18px` | **600 (SemiBold)** | `-0.5px` | Títulos de tarjetas. |
| **Body Strong** | `14px` | **500 (Medium)** | `0px` | Datos en tablas, estados. |
| **Body Regular** | `14px` | **400 (Regular)** | `0px` | Texto general. |
| **Caption/Label** | `12px` | **600 (SemiBold)** | `0.5px` | UPPERCASE labels (ej. "HOY"). |

---

## 3. Espaciado & Grid (8px Base)

Todo debe alinearse a la cuadrícula de 4px/8px para "ritmo visual".

- **Padding Tarjetas**: `24px` (Desktop) / `16px` (Mobile).
- **Gap entre Tarjetas**: `24px`.
- **Gap Interno (Items)**: `12px` o `16px`.
- **Altura Inputs/Botones**: `40px` (Small), `48px` (Regular).

---

## 4. Profundidad & Elevación (Shadows)

El estilo "Plano" (Flat) murió. El estilo 2026 es **"Lifted"** (Elevado).

- **Level 1 (Card Rest)**:  
  `0px 1px 2px rgba(15, 23, 42, 0.06), 0px 1px 3px rgba(15, 23, 42, 0.1)`  
  *Sutil, separa del fondo.*

- **Level 2 (Hover/Dropdown)**:  
  `0px 4px 6px -1px rgba(15, 23, 42, 0.1), 0px 2px 4px -1px rgba(15, 23, 42, 0.06)`  
  *Interactivo, invita al clic.*

- **Level 3 (Modal/Hero)**:  
  `0px 20px 25px -5px rgba(15, 23, 42, 0.1), 0px 10px 10px -5px rgba(15, 23, 42, 0.04)`  
  *Profundidad real.*

---

## 5. Border Radius (Suavidad)

- **Container/Card**: `16px` (Más suave, moderno).
- **Inner Element (Button/Input)**: `8px` or `10px`.
- **Badge/Tag**: `999px` (Pill shape).

---

## 6. Layout Definitivo & Cambios vs Anterior

### **A. Hero Section "Dark/Gradient"**
- **Antes**: Fondo blanco igual que el resto. Aburrido.
- **Nuevo**: Un bloque superior distintivo. Puede ser un **Panel Oscuro (Midnight Blue)** o un **Panel Blanco con Glow Sutil**.
- **Contenido**: 
    - **Izquierda**: Métrica Masiva ("€1,250.00") + Badge de Tendencia (+12%).
    - **Fondo**: Gráfico de área (Sparkline) que cruza toda la tarjeta por detrás de los números, desvaneciéndose.
    - **Efecto**: Se siente como una "Consola de Mando".

### **B. Panel "Estado del Negocio" (Scoring System)**
- **Antes**: Lista de checklist vertical.
- **Nuevo**: **Scorecard Horizontal**.
    - "Setup Score: 75%".
    - Barra de progreso visual.
    - 3 Tarjetas cuadradas debajo para acciones rápidas (Conectar Stripe, Menú, QR).
    - Uso de iconos DUOTONE (dos tonos del mismo color) para elegancia.

### **C. Live Feed "Rich List"**
- **Antes**: Lista de texto simple.
- **Nuevo**: **Rich Objects**.
    - Icono con fondo de color (Avatar redondo).
    - Dos líneas de texto con jerarquía clara (Título negro, subtítulo gris).
    - Estado a la derecha (Pill badge).
    - *Animación*: Highlight flash cuando entra un nuevo pedido.

### **D. Quick Actions "Visual Grid"**
- **Antes**: Botones de texto o tarjetas simples.
- **Nuevo**: **Grid de "Botones Gigantes"**.
    - Icono de 32px.
    - Título fuerte.
    - Hover: El borde se ilumina con el color primario (Indigo) y la tarjeta se "levanta" (Level 2 shadow).

---

## Resumen de Personalidad
No es "una herramienta administrativa". **Es el corazón financiero y operativo del restaurante.**
Cada píxel debe gritar: *"Tu negocio está bajo control y creciendo".*
