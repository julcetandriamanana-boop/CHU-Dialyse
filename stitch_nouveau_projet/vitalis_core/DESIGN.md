# Design System Specification: Clinical Precision & Tonal Depth

## 1. Overview & Creative North Star
**Creative North Star: "The Ethereal Clinic"**
In a medical environment, the "template" look—characterized by heavy grids and rigid borders—creates visual fatigue and mental clutter. This design system moves away from the mechanical toward a "Digital Sanatorium" aesthetic: a sophisticated, editorial approach that prioritizes calm, clarity, and intentionality. 

We break the standard hospital UI mold by utilizing **Asymmetric Informational Anchoring**. Instead of a centered, balanced grid, we use a weighted layout where primary patient data is "anchored" on expansive white space, while secondary clinical actions float in layered, semi-transparent containers. This creates a sense of "organized breathing room," reducing the cognitive load on healthcare professionals.

---

## 2. Colors: Tonal Architecture
The palette is built on a foundation of professional blues and sterile, high-end whites. We treat color not as a decoration, but as a structural material.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Boundaries must be defined through background color shifts or tonal transitions.
*   **The Technique:** A `surface-container-low` section sitting on a `background` provides all the definition needed. If you feel the urge to draw a line, increase the contrast between background tiers instead.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine, frosted glass.
*   **The Stack:** `surface` (Base) → `surface-container-low` (Sub-sections) → `surface-container-highest` (Interactive Focus/Active Cards).
*   **Example:** A patient's vitals panel should use `surface-container-lowest` to "pop" subtly against a `surface-container` dashboard.

### The "Glass & Gradient" Rule
To escape the "standard software" feel, floating elements (modals, dropdowns, or hovering action bars) should utilize **Glassmorphism**:
*   **Token:** `surface-container-lowest` at 80% opacity with a `24px` backdrop-blur. 
*   **Signature Gradients:** For primary CTAs or high-level status summaries, use a subtle linear gradient from `primary` (#00478d) to `primary_container` (#005eb8) at a 135-degree angle. This adds "soul" and depth to critical touchpoints.

---

## 3. Typography: Editorial Authority
We utilize a dual-font strategy to balance high-end branding with clinical utility.

*   **The Display & Headline (Manrope):** Chosen for its geometric modernism. Use `display-lg` and `headline-md` for patient names and high-level hospital metrics. The wide apertures of Manrope ensure that even at large scales, the UI feels approachable, not imposing.
*   **The Body & Labels (Inter):** The industry standard for legibility. All medical data, lab results, and dosage instructions must use `body-md` or `body-sm`. 
*   **The Hierarchy of Urgency:** Use `title-lg` in `on_surface` for standard headings, but switch to `title-md` in `tertiary` (#940010) for critical alerts.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often too "dirty" for a clean medical UI. We achieve depth through **Ambient Light Physics**.

*   **The Layering Principle:** Place `surface-container-lowest` cards on a `surface-container-low` background to create a "soft lift." This mimics the look of high-quality stationery.
*   **Ambient Shadows:** For floating elements (Modals/Poppers), use a shadow with a blur of `40px` and an opacity of `6%`. The shadow color must be a tinted version of `on-surface` (#191c1d) to ensure it feels like a natural occlusion of light.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline-variant` token at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components: Ergonomic Precision

### Buttons & Chips
*   **Primary Button:** Uses the Signature Gradient (`primary` to `primary_container`). Use `rounded-md` (0.375rem) to maintain a professional, architectural feel.
*   **Status Chips:** Forbid high-saturation backgrounds. Use `error_container` with `on_error_container` text for "Critical" states. The shape should be `rounded-full` to distinguish them from interactive buttons.

### Clinical Data Lists
*   **The Divider Ban:** Do not use horizontal lines between patient records. Use a `16px` vertical gap (`spacing-4`) and a subtle hover state shift to `surface-container-high`.
*   **Data Density:** Use `body-sm` for secondary metadata (e.g., "Last updated 2h ago") to create a clear visual contrast with primary medical values.

### Input Fields
*   **The "Silent" Input:** Default state should have no border, only a `surface-container-highest` background. The `outline` token only appears on `:focus` to signify intent. This reduces "visual noise" in dense forms.

### Custom Component: The "Vitality Sparkline"
Medical data is temporal. Replace static numbers with a small, monochromatic sparkline using the `secondary` color, providing context without cluttering the screen.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use `tertiary` (#940010) sparingly. It is a "surgical" color—only for life-critical alerts or errors.
*   **Do** embrace white space. If a screen feels crowded, increase the padding to `xl` (0.75rem) or higher.
*   **Do** use `surface_bright` to highlight the most recently updated data point in a list.

### Don't
*   **Don't** use pure black (#000000). Use `on_surface` (#191c1d) to maintain a sophisticated, low-contrast feel that prevents eye strain during 12-hour shifts.
*   **Don't** use "Alert Yellow." Use our `secondary` and `primary` scales to indicate importance; only use `tertiary` for genuine danger.
*   **Don't** use hard corners. Always apply at least `rounded-sm` (0.125rem) to soften the mechanical nature of the medical data.

---

## 7. Roundedness Scale Reference
*   **Containers/Cards:** `lg` (0.5rem)
*   **Buttons/Inputs:** `md` (0.375rem)
*   **Chips/Status Bullets:** `full` (9999px)
*   **Small UI Details:** `sm` (0.125rem)