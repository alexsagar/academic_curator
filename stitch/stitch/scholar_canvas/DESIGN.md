# Design System Specification: The Academic Curator

This design system is engineered to transform the student portfolio from a static resume into a high-end digital gallery. It moves away from the "template" feel of traditional builders by prioritizing editorial whitespace, tonal depth, and a sophisticated "No-Line" philosophy.

## 1. Creative North Star: The Digital Curator
The "Digital Curator" aesthetic treats every student project as a piece of art in a high-end gallery. Instead of rigid boxes and heavy borders, we use **Intentional Asymmetry** and **Tonal Layering**. The goal is to make the interface feel like a series of "nested sheets" of fine paper and frosted glass, providing a professional, authoritative stage for student work while remaining approachable and fluid.

---

## 2. Color & Surface Philosophy

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Boundaries must be established through background color shifts.
*   **The Logic:** Using `surface-container-low` (#f2f4f6) for a side panel against a `surface` (#f7f9fb) main body creates a sophisticated, modern transition that is felt rather than seen.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack. Importance is defined by the "elevation" of the surface color:
1.  **Base Layer:** `surface` (#f7f9fb) — The primary canvas.
2.  **Inset Content:** `surface-container-low` (#f2f4f6) — Used for grouping related elements.
3.  **Floating Elements:** `surface-container-lowest` (#ffffff) — Used for high-priority cards that need to "pop" off the page.
4.  **Interaction Layers:** `surface-container-high` (#e6e8ea) — Used for hover states or active selection backgrounds.

### Glass & Signature Textures
To provide "soul," avoid flat colors for primary actions. 
*   **The Signature CTA:** Use a linear gradient for `primary` elements, transitioning from `primary` (#006591) to `primary_container` (#0ea5e9) at a 135° angle.
*   **Glassmorphism:** For navigation bars or floating action buttons, use `surface_container_lowest` at 80% opacity with a `backdrop-blur` of 12px.

---

## 3. Typography: Editorial Authority

We use a dual-font system to balance character with readability.

*   **Display & Headlines (Manrope):** High-end and geometric. These are used to create "Brand Moments." Use `display-lg` (3.5rem) with tighter letter-spacing (-0.02em) to give portfolios an editorial, magazine-like feel.
*   **Body & Labels (Inter):** The workhorse. Inter provides maximum legibility for student bios and project descriptions. 
*   **Hierarchy Tip:** Use `headline-sm` (1.5rem) in `on_surface_variant` (#3e4850) for sub-headers to create a soft, sophisticated contrast against the jet-black `on_surface` (#191c1e) titles.

---

## 4. Elevation & Depth

### The Layering Principle
Forget shadows for structural grouping. Instead, stack your tokens:
*   Place a `surface-container-lowest` (#ffffff) card on top of a `surface-container` (#eceef0) background. This creates a "soft lift" that feels natural and premium.

### Ambient Shadows
When an element must float (e.g., a Modal or Popover):
*   **Blur:** 24px - 40px.
*   **Opacity:** 4% - 6%.
*   **Tint:** Use a shadow color derived from `on_surface` (#191c1e). Never use pure black (#000).

### The "Ghost Border" Fallback
If accessibility requires a border, use the **Ghost Border**:
*   **Token:** `outline_variant` (#bec8d2) at **15% opacity**. This provides a hint of structure without breaking the minimalist flow.

---

## 5. Component Guidelines

### Buttons (The "Call to Vision")
*   **Primary:** Gradient of `primary` to `primary_container`. Roundedness: `md` (0.375rem). Text: `label-md` (Uppercase, 0.05em tracking).
*   **Secondary:** `surface_container_highest` (#e0e3e5) with `on_surface` text. No border.
*   **Tertiary:** Transparent background, `primary` text. Use for low-emphasis actions like "Cancel" or "View Less."

### Cards (The "Work Gallery")
*   **Rule:** Forbid divider lines. 
*   **Implementation:** Separate the "Image Area" from the "Text Area" using a `3` (1rem) spacing gap. Use `surface_container_low` for the card background to subtly distinguish it from the `surface` page background.

### Input Fields
*   **Default State:** `surface_container_highest` (#e0e3e5) background with a `sm` (0.125rem) rounded corner.
*   **Focus State:** Shift background to `surface_container_lowest` (#ffffff) and apply a 2px "Ghost Border" of `primary`.
*   **Labels:** Always use `label-md` in `on_surface_variant`.

### Signature Component: The "Project Breadcrumb"
A horizontal, scrolling list of `Selection Chips` using `surface_container_low`. On selection, the chip should transition to `primary` with `on_primary` text using a 200ms spring animation.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins (e.g., a wider left margin than right) for portfolio headers to create an "Architectural" feel.
*   **Do** utilize the `16` (5.5rem) and `20` (7rem) spacing tokens between major sections to let the content breathe.
*   **Do** use `tertiary` (#8a5100) sparingly for "Warning" or "Special Recognition" badges to provide a warm, sophisticated accent.

### Don’t
*   **Don’t** use a `1px` border to separate a sidebar from a main view. Use a background color shift to `surface-container-low`.
*   **Don’t** use high-contrast drop shadows. If it looks like a "button," the shadow is too dark.
*   **Don’t** crowd the interface. If a student's project description is long, use `body-md` with a line-height of 1.6 to ensure it remains "Inviting" rather than "Intimidating."