# Plasma Dashboard - Design Tokens Quick Reference

## 🎨 **BRAND COLORS**

### Primary Palette
```
🔵 PRIMARY BLUE     #314ca0     RGB(49, 76, 160)
🔴 PRIMARY RED      #E53E3E     RGB(229, 62, 62)
⚫ DARK BLUE        #2a4085     RGB(42, 64, 133)
🔴 DARK RED         #c53030     RGB(197, 48, 48)
```

### How We Use Colors:
- **Blue (#314ca0)** → Main buttons, links, navigation, brand identity
- **Red (#E53E3E)** → Call-to-actions, accents, highlights, alerts
- **White** → Card backgrounds, clean surfaces
- **Light Grays** → Secondary backgrounds, subtle elements

---

## 📝 **TYPOGRAPHY**

### Font Families
1. **Lato** (Body Text)
   - Regular (400) for body text
   - Bold (700) for emphasis
   - Clean, modern, highly readable

2. **Roboto** (Headings)
   - Bold (700) only
   - Used for page titles and major headings
   
3. **Manrope** (Branding)
   - Logo and special brand elements
   - Modern geometric sans-serif

### Font Size Hierarchy
```
H1 / Page Titles:     56px (Hero) / 32px (Pages)
H2 / Section Titles:  45px
H3 / Widget Headers:  24px
Card Titles:          18px
Body Text:            16px (standard)
Small Text:           14px
Labels/Badges:        12px
```

---

## 📐 **SPACING SYSTEM**

Our spacing follows a consistent 4px/8px grid:

```
Tiny:      4px   (0.25rem)  - Minimal gaps
Small:     8px   (0.5rem)   - Tight spacing
Medium:    16px  (1rem)     - Standard spacing
Large:     24px  (1.5rem)   - Between sections
XL:        32px  (2rem)     - Major sections
XXL:       48px  (3rem)     - Page sections
```

### Common Component Padding
- **Cards/Tiles:** 24-32px
- **Buttons:** 12px vertical, 24px horizontal
- **Input Fields:** 16-20px
- **Dashboard Pages:** 40px all around

---

## 🔲 **ROUNDED CORNERS**

```
Small:      4-6px    - Small elements, badges
Medium:     8-12px   - Buttons, inputs, tags
Large:      12-16px  - Cards, panels
XL:         20-24px  - Large containers, modals
Circular:   50%      - Avatars, icon buttons
Pill:       999px    - Pill-shaped buttons
```

---

## 🌒 **SHADOWS & DEPTH**

We use 4 elevation levels:

**Level 1 - Subtle**
- Input fields, subtle hover effects

**Level 2 - Card**
- Default cards, dropdown menus, tiles

**Level 3 - Elevated**
- Hover states, active elements

**Level 4 - Floating**
- Modals, overlays, major pop-ups

All shadows use our brand blue (#314ca0) with varying opacity for consistency.

---

## ✨ **SPECIAL EFFECTS**

### Glassmorphism (AI Assistant Interface)
- Semi-transparent white background
- 20px blur effect
- Subtle border
- Creates modern "frosted glass" look

### Gradients
We use gradients for visual interest:
- **Main Gradient:** Blue → Red → Blue (brand identity)
- **Background Gradient:** Subtle white → light gray transitions
- **Button Gradient:** Blue → darker blue (depth)

---

## 🎯 **KEY COMPONENTS**

### Buttons
**Primary (Blue)**
- Background: Blue gradient
- White text
- 12px padding top/bottom, 24px left/right
- 12px rounded corners
- Soft shadow

**Secondary (Red)**
- Same as primary but uses red gradient
- For secondary actions

**Outline**
- Transparent background
- Blue border
- Fills with blue on hover

### Cards/Tiles
- White to light gray gradient background
- 16-20px rounded corners
- 24-32px padding
- 4px colored top border (accent)
- Soft shadow
- Hover: lifts up slightly (-4px transform)

### Input Fields
- Light gray background
- 2px border (gray → blue on focus)
- 12px rounded corners
- 16-20px padding
- Focus: blue border + shadow glow

### Modals
- Large rounded corners (20-24px)
- Floating shadow (level 4)
- Blurred dark overlay background
- 6px gradient stripe at top
- White/light gray gradient background

---

## 🌓 **DARK MODE**

The application fully supports dark mode:

**Dark Theme Colors:**
- Background: Very dark blue (#0f172a)
- Cards: Dark slate (#1e293b)
- Text: Light gray to white
- Blue accent becomes lighter (#60a5fa)
- All borders become subtle white with opacity

**Auto-switches based on:** User preference toggle

---

## 📱 **RESPONSIVE DESIGN**

### Breakpoints
```
Mobile S:     360px   (Extra small phones)
Mobile:       480px   (Phones)
Tablet:       768px   (Tablets, large phones)
Desktop S:    1024px  (Small desktops)
Desktop:      1200px  (Standard desktops)
Desktop L:    1400px  (Large screens)
Desktop XL:   1600px  (Extra large)
Desktop 2K:   1920px  (4K/2K displays)
```

### Responsive Behavior
- Dashboard sidebar: 280px → 70px (collapsed) → hidden on mobile
- Cards: 4 columns → 2 columns → 1 column
- Font sizes: Slightly reduce on mobile
- Padding: 40px → 30px → 20px → 16px

---

## 🎨 **DATA VISUALIZATION**

### Chart Color Palette
1. Primary Blue (#314ca0)
2. Primary Red (#E53E3E)
3. Light Blue (#60a5fa)
4. Orange (#F59E0B)
5. Green (#22c55e)
6. Purple (#8b5cf6)

Use these colors in order for multi-series charts.

### Chart Styling
- Grid lines: Very light gray
- Axis labels: Medium gray (#64748b)
- Tooltips: White with shadow
- Data points: Bold and clear

---

## 💡 **DESIGN PRINCIPLES**

### 1. **Consistency**
- Use the same spacing system throughout
- Stick to defined colors
- Maintain typography hierarchy

### 2. **Clarity**
- High contrast for readability
- Clear visual hierarchy
- Ample white space

### 3. **Modern & Professional**
- Soft shadows (not harsh)
- Subtle gradients (not overwhelming)
- Rounded corners (not sharp)
- Clean, uncluttered layouts

### 4. **Accessibility**
- WCAG AA compliant contrast ratios
- Clear focus states
- Readable font sizes (minimum 14px)
- Keyboard navigation support

---

## 🎯 **QUICK DECISION GUIDE**

### "What color should I use?"
- **Primary action?** → Blue (#314ca0)
- **Important call-to-action?** → Red (#E53E3E)
- **Text?** → Dark gray (#1e293b) or white (dark mode)
- **Background?** → White or light gray (#f8fafc)
- **Subtle element?** → Light gray (#e2e8f0)

### "How much spacing?"
- **Between elements?** → 16-24px
- **Inside a card?** → 24-32px
- **Between sections?** → 32-48px
- **Tight spacing?** → 8-12px

### "How rounded?"
- **Button?** → 12px
- **Card?** → 16-20px
- **Modal?** → 20-24px
- **Avatar?** → 50% (circle)

---

## 📊 **BRAND CONSISTENCY CHECKLIST**

✅ Always use primary blue (#314ca0) for main actions  
✅ Red accents should be used sparingly  
✅ Maintain consistent spacing (multiples of 4 or 8)  
✅ Use gradients for visual interest, not functionality  
✅ Cards should have subtle shadows and rounded corners  
✅ Text should be readable (good contrast)  
✅ Animations should be quick (under 0.3s)  
✅ Dark mode should feel cohesive with light mode  
✅ Logo should use Manrope font with plasma dot effect  

---

## 🔗 **RESOURCES**

### Fonts Used
- **Google Fonts:** Lato, Roboto
- **Bundled:** Manrope, JetBrains Mono (via Tailwind)

### Tools
- **CSS Variables:** All colors accessible via `var(--primary)` etc.
- **Tailwind CSS:** Utility-first framework
- **Dark Mode:** `data-theme="dark"` attribute

---

## 📧 **CONTACT**

For design system questions or updates, please contact the development team.

---

*This design system ensures consistency and professionalism across the entire Plasma Dashboard platform.*

**Version:** 1.0  
**Last Updated:** November 2024

