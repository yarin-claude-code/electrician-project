# Frontend Design Rules — Electrical Inspection Tracker

## Always Do First
- **Check `images/` for design references** before building any new UI component or page. The folder contains reference images for buttons, cards, date pickers, radio buttons, search bars, steppers, toggles, and color palettes.
- Run `npm run dev` to start the Turbopack dev server on `http://localhost:3000` before taking any screenshots. Do not start a second instance if already running.

## Reference Images
- If a reference image is provided (from `images/` or by the user): match layout, spacing, typography, border-radius, and color exactly. Do not improve or add to the design.
- If no reference image exists for a component: design from scratch following the existing shadcn/ui theme and the guardrails below.
- Screenshot your output, compare against the reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or the user says so.

## Design Reference Catalog (`images/`)
| File | What it defines |
|------|----------------|
| `general-colors-pallete.png` | Project color palette — use these exact colors |
| `buttons-shape.png` / `buttons-shape-large.png` / `buttons-shape-medium.png` | Button styles by size |
| `round-buttons.png` | Icon / FAB button styles |
| `cards-style.png` | Card component appearance |
| `date-pickers-style.png` | Date picker styling |
| `radio-buttons.png` | Radio button styling |
| `search-bar-style.png` | Search input styling |
| `stepper-style.png` | Wizard stepper / progress indicator |
| `toggles-style.png` | Toggle switch styling |

## Screenshot Workflow
- Use Puppeteer to screenshot from `http://localhost:3000` (never `file:///`).
- After screenshotting, read the PNG with the Read tool to visually compare.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px".
- Check: spacing/padding, font size/weight/line-height, colors (exact OKLCH values from `globals.css`), alignment, border-radius, shadows, RTL text direction.

## Styling Rules
- **Colors:** Use only the OKLCH theme variables defined in `src/app/globals.css`. Never hardcode hex/rgb values or use default Tailwind palette colors. Always reference `images/general-colors-pallete.png` for the project palette.
- **Components:** Use shadcn/ui primitives from `src/components/ui/`. Do not create custom components when a shadcn/ui primitive exists (Button, Card, Dialog, Select, Tabs, etc.).
- **Dark mode:** Every new component must work in both light and dark modes. Use semantic color variables (`bg-background`, `text-foreground`, `bg-card`, etc.), never raw color classes.
- **RTL:** All layouts must be RTL-correct. Use logical properties (`ps-4` not `pl-4`, `ms-2` not `ml-2`, `start` not `left`). Test that text, icons, and layouts mirror correctly.
- **Typography:** Use the Geist font family (set via `--font-geist-sans`). Hebrew UI text should render cleanly at all sizes.
- **Spacing:** Use consistent Tailwind spacing tokens. Match the spacing patterns already established in existing components.
- **Radius:** Use the theme radius scale (`rounded-sm`, `rounded-md`, `rounded-lg`, etc.) which maps to the `--radius` variable in globals.css.
- **Shadows:** Use layered, subtle shadows. Avoid flat `shadow-md` on its own.
- **Animations:** Only animate `transform` and `opacity`. Never use `transition-all`. Use `tw-animate-css` utilities for entrance animations.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. Use Radix primitive built-in states where available.
- **Icons:** Use lucide-react icons exclusively. Do not mix icon libraries.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot comparison pass
- Do not use `transition-all`
- Do not hardcode colors — always use theme variables
- Do not use `pl-*`/`pr-*`/`ml-*`/`mr-*` — use logical `ps-*`/`pe-*`/`ms-*`/`me-*` for RTL
- All UI text must be in Hebrew; all code identifiers in English
