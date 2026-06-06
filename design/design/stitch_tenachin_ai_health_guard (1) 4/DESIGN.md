---
name: Tenachin AI
colors:
  surface: '#0e1511'
  surface-dim: '#0e1511'
  surface-bright: '#343b36'
  surface-container-lowest: '#09100c'
  surface-container-low: '#161d19'
  surface-container: '#1a211d'
  surface-container-high: '#242c27'
  surface-container-highest: '#2f3632'
  on-surface: '#dde4dd'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dde4dd'
  inverse-on-surface: '#2b322d'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#bcc7de'
  on-secondary: '#263143'
  secondary-container: '#3e495d'
  on-secondary-container: '#aeb9d0'
  tertiary: '#ffb3af'
  on-tertiary: '#650911'
  tertiary-container: '#fc7c78'
  on-tertiary-container: '#711419'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#842225'
  background: '#0e1511'
  on-background: '#dde4dd'
  surface-variant: '#2f3632'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base-unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style
The brand personality is high-stakes, cinematic, and profoundly precise. It targets medical professionals and researchers who require data-dense environments that remain visually calm under pressure. 

The design style is **Modern Glassmorphism** fused with a **Corporate/Modern** reliability. It uses deep, dark backgrounds to reduce eye strain in clinical settings, while leveraging translucency and "glowing" semantic accents to draw immediate attention to critical patient data. The aesthetic should evoke a sense of advanced intelligence—clean, expensive, and authoritative—moving away from traditional "hospital white" into a premium, tech-forward dark mode.

## Colors
The palette is rooted in a deep charcoal base to provide maximum contrast for clinical data. 

- **Primary & Safe:** Clinical Emerald Green is used for primary actions, "normal" vitals, and successful system states.
- **Surface & Secondary:** Rich Slate Grey serves as the foundation for cards and navigation elements, often applied with varying levels of transparency.
- **Semantic Accents:** Warning Amber and Ruby Crimson are reserved strictly for diagnostic alerts and critical system errors.
- **Neutral/Text:** Use pure white (#FFFFFF) for primary headers and a muted slate-white (rgba(255, 255, 255, 0.7)) for secondary body text to maintain hierarchy.

## Typography
This design system utilizes **Inter** for its exceptional legibility in high-density data environments. 

- **Hierarchy:** Use bold weights and negative letter-spacing for headlines to create a "sharp" medical instrument feel. 
- **Data Display:** For numerical vitals and code-based data, a secondary monospaced font (JetBrains Mono) is permitted to ensure character alignment and rapid scanning.
- **Labels:** Use uppercase labels with increased tracking for section headers within cards to maintain organization without adding visual bulk.

## Layout & Spacing
The layout follows a **Fluid Grid** model based on a 12-column system. Despite the data density, the system prioritizes "breathable" margins to prevent cognitive overload.

- **Desktop:** 24px gutters with 40px side margins. Elements should typically span 3, 4, or 6 columns.
- **Mobile:** Transition to a single-column stack with 16px margins. 
- **Density:** Components use a tight 4px-base increment internally (e.g., 8px padding inside a chip, 16px inside a card) to keep information compact but accessible.

## Elevation & Depth
Depth is achieved through **Glassmorphism** rather than traditional heavy shadows.

- **Surface Layer:** 1px solid white border at 10% opacity. 
- **Backdrop:** 20px - 40px Gaussian blur on the background layer behind cards.
- **Glow Effects:** Critical alerts use a soft, outer glow (8px - 16px spread) using the semantic color (e.g., a subtle red glow for critical vitals) to simulate a light-emitting medical monitor.
- **Layering:** Active modals should appear with a darker backdrop overlay (50% black) to push the glass surface forward.

## Shapes
The shape language is **Rounded**, balancing the "sharpness" of the typography. 

- **Cards & Panels:** Use 1rem (16px) corner radius to soften the technical interface.
- **Interactive Elements:** Buttons and toggles should lean toward the **Pill-shaped** aesthetic (rounded-full) to clearly distinguish them from static data containers.
- **Inputs:** Maintain a consistent 0.5rem (8px) radius to ensure they feel structured and precise.

## Components
- **Buttons:** Primary buttons are solid Clinical Emerald. Secondary buttons use the "Glass" style: transparent background, 1px border, and a subtle hover glow.
- **Pill Toggles:** High-contrast toggles with a distinct "on" glow. The "off" state should be semi-transparent slate.
- **Glass Cards:** The signature component. Features a `rgba(255, 255, 255, 0.05)` top-to-bottom gradient and a 1px border. 
- **Data Chips:** Small, pill-shaped indicators for status. Use semantic background colors at 15% opacity with 100% opacity text for high readability.
- **Inputs:** Darker than the card background (#000000 at 20% opacity) with a focus state that illuminates the 1px border in Emerald Green.
- **Vitals Monitor:** A specialized component featuring a sparkline graph with a semi-transparent fill and a glowing data point at the current value.