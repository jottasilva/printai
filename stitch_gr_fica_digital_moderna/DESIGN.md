```markdown
# Design System Documentation: High-End Print Operations

## 1. Overview & Creative North Star: "The Precision Atelier"
This design system moves beyond the standard SaaS "dashboard" aesthetic to create a digital environment that feels like a high-end, architectural workshop. Taking inspiration from the utility of Notion and the polished precision of Stripe, our North Star is **The Precision Atelier**.

In a print shop ERP, speed and operational clarity are paramount. We achieve this not through more lines, but through **Tonal Architecture**. We treat the UI as a series of stacked, tactile materials. By utilizing intentional asymmetry, breathing room, and sophisticated layering, we eliminate visual noise and allow the status of a print job to "glow" against a serene, neutral backdrop.

---

## 2. Color & Tonal Architecture
The palette is rooted in a "cool-neutral" foundation, allowing functional status colors to act as beacons of information.

### The "No-Line" Rule
**Explicit Instruction:** Traditional 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined through background shifts.
*   **Method:** Use `surface-container-low` for secondary sections and `surface-container-lowest` for primary work surfaces.
*   **Result:** A interface that feels expansive and modern, rather than "boxed in."

### Surface Hierarchy & Nesting
Treat the UI as physical layers. Each deeper level of interaction should shift in tone:
1.  **Canvas (Base):** `background` (#f7f9fb)
2.  **Sectioning:** `surface-container-low` (#f0f4f7)
3.  **Actionable Cards:** `surface-container-lowest` (#ffffff)
4.  **Raised Interaction:** `surface-bright` (#f7f9fb)

### The Glass & Gradient Rule
To provide "soul" to an otherwise utilitarian ERP:
*   **Glassmorphism:** Use semi-transparent `surface-container-lowest` with a `backdrop-filter: blur(12px)` for floating navigation bars or contextual menus.
*   **Signature Gradients:** For high-value actions, use a subtle linear gradient from `primary` (#565e74) to `primary_dim` (#4a5268) at a 145-degree angle.

### Functional Status Tokens
These are the only high-chroma elements allowed, representing the lifecycle of a print order:
*   **New:** `primary_container` (#dae2fd) - Blue
*   **Production:** `secondary_fixed` (#d3e4fe) - Soft Blue/Yellow Tint
*   **Finishing:** `tertiary_fixed` (#8342f4) - Purple
*   **Ready:** `on_tertiary_container` (Applied to backgrounds) - Green
*   **Overdue:** `error` (#9f403d) - Red

---

## 3. Typography: Editorial Utility
We use **Inter** not as a default font, but as a precision tool. The hierarchy is designed to mirror a high-end technical manual.

*   **The Power of Display:** Use `display-sm` (2.25rem) for high-level shop metrics. These should be set with a letter-spacing of `-0.02em` to feel "tight" and authoritative.
*   **The Utility Label:** `label-md` and `label-sm` are the workhorses of the ERP. Use `on_surface_variant` (#566166) for metadata to ensure it recedes, allowing `body-md` order details to take center stage.
*   **Intentional Asymmetry:** Align Headlines to the left with generous top-padding to create a "starting point" for the eye, avoiding the centered "template" look.

---

## 4. Elevation & Depth
We reject the standard "drop shadow" in favor of natural light physics.

*   **The Layering Principle:** Depth is achieved by stacking `surface-container` tiers. A `surface-container-highest` card sitting on a `surface` background provides enough contrast to imply elevation without a single pixel of shadow.
*   **Ambient Shadows:** For floating modals, use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(42, 52, 57, 0.06);`. The shadow color is a 6% opacity version of `on_surface`, making it feel like part of the environment.
*   **The Ghost Border:** If contrast is required (e.g., in a complex data grid), use a 1px border of `outline_variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons (The Tactile Strike)
*   **Primary:** A solid `primary` (#565e74) base with `DEFAULT` (8px) radius. No border. On hover, transition to `primary_dim`.
*   **Tertiary:** No background, no border. Use `primary` text. These are used for "Cancel" or "Back" to reduce visual weight.

### Input Fields (The Data Portal)
*   **Style:** Background set to `surface_container_low`. On focus, shift background to `surface_container_lowest` and apply a 2px "Ghost Border" of `primary`.
*   **Validation:** Use `error` (#9f403d) only for the helper text; do not turn the entire input red unless the error is critical.

### Cards & Lists (The Workflow)
*   **Constraint:** **Forbid dividers.** To separate print jobs in a list, use a 12px vertical gap (`8px system` x 1.5) and alternating tonal shifts or simply whitespace. 
*   **Status Indicators:** Use `Chips` with a background of the status color at 20% opacity and text at 100% opacity.

### Kanban/Production Columns
*   Use `surface_container` for the column background. Each job card should be `surface_container_lowest` (white). This creates a "card-on-table" metaphor that is easy for production staff to parse at a glance.

---

## 6. Do’s and Don’ts

### Do
*   **DO** use whitespace as a functional tool. If a screen feels cluttered, increase the margin, don't add a border.
*   **DO** use `tertiary` (Purple) exclusively for "Finishing" stages to create a mental shortcut for floor staff.
*   **DO** respect the `8px` grid religiously. Precision in the ERP reflects precision in the print shop.

### Don't
*   **DON'T** use 100% black (#000000). Always use `on_surface` (#2a3439) to maintain the premium, "ink-on-paper" feel.
*   **DON'T** use heavy drop shadows. They create "visual mud" and slow down the user's ability to scan data.
*   **DON'T** use generic icons. Use thin-stroke (1.5pt) icons that match the weight of the Inter typeface.

---

## Director’s Final Note
This system is not about decoration; it is about **clarity through sophistication**. By removing the "scaffolding" of borders and lines, we allow the shop's data—the jobs, the deadlines, the colors—to become the UI itself. Use the tonal shifts to guide the user's hand, and let the typography provide the authority.```