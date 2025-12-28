# Plasma Dashboard Design System

## Design Token Documentation for Business Stakeholders

---

## 📝 Overview
This document outlines all design tokens (colors, fonts, spacing, etc.) used in the Plasma Dashboard application. These tokens ensure consistency across the entire platform.

---

## 🎨 Color Palette

### Primary Brand Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Primary Blue** | `#314ca0` | rgb(49, 76, 160) | Main brand color, buttons, links, headers |
| **Dark Blue** | `#2a4085` | rgb(42, 64, 133) | Button hover states, darker accents |
| **Deep Blue** | `#1e3a8a` | rgb(30, 58, 138) | Darkest blue for emphasis |
| **Primary Red** | `#E53E3E` | rgb(229, 62, 62) | Accent color, alerts, CTAs |
| **Dark Red** | `#c53030` | rgb(197, 48, 48) | Red hover states |

### Neutral Colors (Light Theme)

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **White** | `#ffffff` | rgb(255, 255, 255) | Backgrounds, cards |
| **Light Gray** | `#f8fafc` | rgb(248, 250, 252) | Secondary backgrounds |
| **Medium Gray** | `#f1f5f9` | rgb(241, 245, 249) | Tertiary backgrounds |
| **Cool Gray** | `#e2e8f0` | rgb(226, 232, 240) | Borders, dividers |
| **Border Gray** | `#cbd5e1` | rgb(203, 213, 225) | Input borders |

### Text Colors (Light Theme)

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Primary Text** | `#1e293b` | rgb(30, 41, 59) | Main body text, headings |
| **Secondary Text** | `#64748b` | rgb(100, 116, 139) | Secondary information |
| **Tertiary Text** | `#94a3b8` | rgb(148, 163, 184) | Placeholder text, disabled text |
| **Muted Text** | `#9ca3af` | rgb(156, 163, 175) | Subtle text |

### Dark Mode Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Dark BG Primary** | `#0f172a` | rgb(15, 23, 42) | Main dark background |
| **Dark BG Secondary** | `#1e293b` | rgb(30, 41, 59) | Secondary dark background |
| **Dark BG Tertiary** | `#334155` | rgb(51, 65, 85) | Tertiary dark background |
| **Dark Text Primary** | `#f1f5f9` | rgb(241, 245, 249) | Main dark mode text |
| **Dark Text Secondary** | `#cbd5e1` | rgb(203, 213, 225) | Secondary dark mode text |

### Supporting Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Light Blue** | `#E6E6FF` | rgb(230, 230, 255) | Light accents, backgrounds |
| **Hover Blue** | `#60a5fa` | rgb(96, 165, 250) | Dark mode accent |
| **Success Green** | `#28a745` | rgb(40, 167, 69) | Success messages |
| **Warning Orange** | `#F59E0B` | rgb(245, 158, 11) | Warning messages |
| **Error Red** | `#EF4444` | rgb(239, 68, 68) | Error messages |

### Gradient Patterns

#### Main Gradient
```css
background: linear-gradient(135deg, #314ca0 0%, #E53E3E 50%, #314ca0 100%);
```
Used for: Page titles, logo text, accent lines

#### Background Gradient (Light)
```css
background: linear-gradient(135deg, 
  #ffffff 0%, 
  #f8fafc 25%, 
  #e2e8f0 50%, 
  #f1f5f9 75%, 
  #ffffff 100%);
```

#### Background Gradient (Dark)
```css
background: linear-gradient(135deg, 
  #0f172a 0%, 
  #1e293b 25%, 
  #1e293b 50%, 
  #0f172a 75%, 
  #0f172a 100%);
```

#### Button Gradient
```css
background: linear-gradient(135deg, #314ca0 0%, #2a4085 100%);
```

---

## 🔤 Typography

### Font Families

#### Primary Font Stack
```css
font-family: 'Lato', sans-serif;
```
- **Weight Available:** 400 (Regular), 700 (Bold)
- **Usage:** Body text, general UI elements
- **Source:** Google Fonts

#### Display Font Stack
```css
font-family: 'Roboto', sans-serif;
```
- **Weight Available:** 700 (Bold)
- **Usage:** Page titles, dashboard titles
- **Source:** Google Fonts

#### Brand Logo Font
```css
font-family: 'Manrope', 'system-ui', 'sans-serif';
```
- **Usage:** Sidebar logo, header branding
- **Fallback:** System UI fonts

#### Monospace Font
```css
font-family: 'JetBrains Mono', 'monospace';
```
- **Usage:** Code snippets, technical data

#### Alternative Fonts
- **Heading Font (Tailwind):** `'Manrope', 'system-ui', 'sans-serif'`
- **System Fallback:** `system-ui, Avenir, Helvetica, Arial, sans-serif`

### Font Sizes

| Element | Size | Line Height | Weight | Usage |
|---------|------|-------------|--------|-------|
| **Hero Title** | 3.5rem (56px) | 1.2 | 700 | Landing page hero |
| **H1 / Page Title** | 3.2rem (51px) / 2rem (32px) | 1.1 / 1.2 | 700 | Main page headings |
| **Section Title** | 2.8rem (45px) | 1.2 | 600 | Section headings |
| **Widget Title** | 1.5rem (24px) | 1.3 | 700 | Card/widget titles |
| **H3 / Card Title** | 1.125rem (18px) | 1.4 | 700 | Card headers |
| **Body Large** | 1.25rem (20px) | 1.6 | 400 | Large body text |
| **Body** | 1rem (16px) | 1.6 | 400 | Regular body text |
| **Body Small** | 0.95rem (15px) | 1.5 | 500 | Secondary text |
| **Small** | 0.875rem (14px) | 1.5 | 400-600 | Labels, captions |
| **Tiny** | 0.75rem (12px) | 1.4 | 600 | Badges, tags |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Emphasized text |
| Semi-Bold | 600 | Subheadings, buttons |
| Bold | 700 | Headings, important text |

---

## 📏 Spacing Scale

### Base Spacing (rem/px)

| Token | Size (rem) | Size (px) | Usage |
|-------|-----------|-----------|-------|
| `0.25rem` | 0.25 | 4px | Minimal spacing |
| `0.5rem` | 0.5 | 8px | Tight spacing |
| `0.75rem` | 0.75 | 12px | Small spacing |
| `1rem` | 1 | 16px | Base unit |
| `1.25rem` | 1.25 | 20px | Medium-small |
| `1.5rem` | 1.5 | 24px | Medium spacing |
| `2rem` | 2 | 32px | Large spacing |
| `2.5rem` | 2.5 | 40px | Extra large |
| `3rem` | 3 | 48px | Section spacing |
| `4rem` | 4 | 64px | Major sections |

### Tailwind Custom Spacing

| Token | Size | Usage |
|-------|------|-------|
| `spacing-18` | 4.5rem (72px) | Custom large spacing |
| `spacing-88` | 22rem (352px) | Custom extra-large |

### Component Padding

| Component | Padding |
|-----------|---------|
| Dashboard Main | 40px |
| Cards/Tiles | 20-24px |
| Buttons | 0.6em 1.2em |
| Input Fields | 12-20px |
| Modals | 24-32px |

---

## 🔲 Border Radius

| Token | Size | Usage |
|-------|------|-------|
| **Small** | `calc(var(--radius) - 4px)` / 4-6px | Small elements |
| **Medium** | `calc(var(--radius) - 2px)` / 8-12px | Buttons, inputs |
| **Large** | `var(--radius)` / 12-16px | Cards, panels |
| **Extra Large** | 20-24px | Large containers |
| **Round** | 50% / 50px | Circular elements, avatars |
| **Pill** | 9999px / 50px | Pill-shaped buttons |

---

## 🌒 Shadows

### Elevation Levels

#### Level 1 - Subtle
```css
box-shadow: 0 1px 3px rgba(49, 76, 160, 0.1);
```
**Usage:** Subtle elevation, input fields

#### Level 2 - Card
```css
box-shadow: 0 4px 12px rgba(49, 76, 160, 0.15), 
            0 1px 3px rgba(49, 76, 160, 0.1);
```
**Usage:** Cards, tiles, dropdown menus

#### Level 3 - Elevated
```css
box-shadow: 0 8px 30px rgba(49, 76, 160, 0.15), 
            0 4px 6px rgba(49, 76, 160, 0.1);
```
**Usage:** Hover states, modals

#### Level 4 - Floating
```css
box-shadow: 0 20px 60px rgba(49, 76, 160, 0.2), 
            0 8px 25px rgba(49, 76, 160, 0.1);
```
**Usage:** Modals, large overlays

### Glassmorphism Effect
```css
background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.3);
box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
```
**Usage:** AI Assistant interface, modern panels

---

## 🎭 Animations & Transitions

### Timing Functions

| Name | Easing | Usage |
|------|--------|-------|
| **Standard** | `ease` | Default transitions |
| **Smooth** | `cubic-bezier(0.4, 0, 0.2, 1)` | Smooth animations |
| **Bounce** | `ease-out` | Entry animations |
| **Linear** | `linear` | Continuous animations |

### Duration

| Duration | Usage |
|----------|-------|
| 0.2s | Quick transitions (hover) |
| 0.3s | Standard transitions |
| 0.4s | Slower transitions |
| 0.8s | Content fade-ins |

### Named Animations

#### Fade In
```css
@keyframes fade-in {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
animation: fade-in 0.3s ease-out;
```

#### Slide In Right
```css
@keyframes slide-in-right {
  0% { transform: translateX(100%); }
  100% { transform: translateX(0); }
}
animation: slide-in-right 0.3s ease-out;
```

#### Accordion
```css
animation: accordion-down 0.2s ease-out;
animation: accordion-up 0.2s ease-out;
```

---

## 🎯 Component Patterns

### Buttons

#### Primary Button
- **Background:** `linear-gradient(135deg, #314ca0 0%, #2a4085 100%)`
- **Color:** White
- **Padding:** `12px 24px` / `1rem 2rem`
- **Border Radius:** `12px`
- **Font Weight:** 600
- **Shadow:** `0 4px 12px rgba(49, 76, 160, 0.2)`

#### Secondary Button
- **Background:** `linear-gradient(135deg, #E53E3E 0%, #c53030 100%)`
- **Color:** White
- **Same sizing as primary**

#### Outline Button
- **Background:** Transparent
- **Border:** `2px solid #314ca0`
- **Color:** `#314ca0`
- **Hover:** Fills with `#314ca0`, text becomes white

### Cards/Tiles

#### Standard Card
- **Background:** `linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)`
- **Border Radius:** `16-20px`
- **Padding:** `24-32px`
- **Shadow:** Level 2 (Card)
- **Border:** `1px solid rgba(49, 76, 160, 0.1)`
- **Accent:** 4px top gradient border

#### Dark Tile
- **Background:** `linear-gradient(135deg, #314ca0 0%, #2a4085 100%)`
- **Color:** White
- **Border:** `1px solid rgba(255, 255, 255, 0.1)`

### Inputs

#### Text Input
- **Background:** `linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)`
- **Border:** `2px solid rgba(49, 76, 160, 0.2)`
- **Border Radius:** `12px`
- **Padding:** `16px 20px`
- **Font Size:** `16px`
- **Focus Border:** `#314ca0`
- **Focus Shadow:** `0 0 0 4px rgba(49, 76, 160, 0.15)`

### Dropdown/Select
- **Same styling as text input**
- **Custom arrow:** CSS-generated blue chevron

### Modals

#### Standard Modal
- **Background:** `linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)`
- **Border Radius:** `20-24px`
- **Padding:** `32px`
- **Shadow:** Level 4 (Floating)
- **Overlay:** `rgba(0, 0, 0, 0.6)` with `backdrop-filter: blur(8px)`
- **Top Accent:** 6px gradient stripe

---

## 🎨 Sidebar Design

### Dimensions
- **Width (Expanded):** 280px
- **Width (Collapsed):** 70px
- **Header Height:** Variable with logo

### Colors
- **Background:** `var(--sidebar-bg)` - `#f8fafc` (light) / `#1e293b` (dark)
- **Active Item:** `#314ca0` with white text
- **Hover:** `rgba(49, 76, 160, 0.1)`
- **Border:** `1px solid var(--border-color)`

### Nav Items
- **Padding:** `6px 16px`
- **Border Radius:** `8px`
- **Font Size:** `0.95rem`
- **Font Weight:** 500
- **Gap:** `12px` between icon and text

---

## 📊 Data Visualization

### Chart Colors
Primary palette for data visualization:
1. `#314ca0` (Primary Blue)
2. `#E53E3E` (Primary Red)
3. `#60a5fa` (Light Blue)
4. `#F59E0B` (Orange)
5. `#22c55e` (Green)
6. `#8b5cf6` (Purple)

### Chart Styling
- **Grid Lines:** `rgba(100, 116, 139, 0.1)`
- **Axis Labels:** `#64748b`
- **Tooltip Background:** White with shadow
- **Tooltip Border:** `rgba(49, 76, 160, 0.1)`

---

## 🌓 Dark Mode Support

### Implementation
All colors use CSS variables that change based on `data-theme="dark"` attribute on root element.

### Key Differences
- Backgrounds inverted to dark grays
- Text colors inverted to light grays
- Borders become more subtle (white with low opacity)
- Accent colors adjusted for better contrast
- Glassmorphism effects use darker backgrounds

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| **Mobile S** | 360px | Extra small phones |
| **Mobile** | 480px | Small phones |
| **Tablet** | 768px | Tablets, large phones |
| **Desktop S** | 1024px | Small desktops, tablets landscape |
| **Desktop** | 1200px | Standard desktops |
| **Desktop L** | 1400px | Large desktops |
| **Desktop XL** | 1600px | Extra large screens |
| **Desktop 2K** | 1920px | 2K screens |

---

## 🎯 Best Practices

### Color Usage
1. Always use primary blue (`#314ca0`) for primary actions
2. Use red (`#E53E3E`) sparingly for accents and CTAs
3. Maintain 4.5:1 contrast ratio for WCAG AA compliance
4. Use gradients for visual interest but not for critical UI elements

### Typography
1. Limit to 2-3 font families per page
2. Maintain consistent line-height (1.5-1.6 for body)
3. Use font weights to create hierarchy
4. Ensure text is legible at all sizes

### Spacing
1. Use multiples of 4px or 8px for consistency
2. Maintain adequate breathing room in cards (24-32px padding)
3. Keep consistent margins between sections

### Animations
1. Keep under 0.3s for micro-interactions
2. Use ease-out for entry animations
3. Avoid animating too many elements at once
4. Ensure animations don't cause motion sickness

---

## 📦 Export Ready Assets

### Logo Sizes
- **Sidebar Logo:** 55px height
- **Footer Logo:** 40-45px height
- **Form Logo:** 48px height
- **Navbar Logo:** 55-70px height

### Icon Sizes
- **Small:** 16px
- **Medium:** 20-24px
- **Large:** 28-32px
- **Feature Icons:** 48px
- **Hero Icons:** 80-100px

---

## 🔗 References

### External Fonts
- **Google Fonts:** `Roboto:700`, `Lato:400,700`
- **Manrope:** Via Tailwind/system fonts
- **JetBrains Mono:** Via Tailwind configuration

### CSS Variables
All theme colors are available as CSS variables:
- `var(--primary)`, `var(--secondary)`, `var(--accent)`
- `var(--background)`, `var(--foreground)`
- `var(--border)`, `var(--input)`, `var(--card)`
- `var(--radius)` for border radius consistency

---

*Last Updated: November 2024*
*Version: 1.0*

