# CLAUDE.md

## Working principles

- **Think before coding.** Always analyze the problem thoroughly, understand the DOM structure, and plan the CSS approach before writing any code. Quality over quantity.
- **Verify your assumptions.** Read the actual HTML/component templates before writing CSS selectors. Don't guess DOM structures.
- **Minimal, targeted changes.** Don't spray broad CSS rules hoping something sticks. Each rule should target a specific element with a known structure.
- **No hardcoded sizes.** Use relative/flexible units (flex, min-height, em, %) instead of fixed px widths. The app must be responsive on all screen sizes.
- **Test mentally before applying.** Before writing a CSS rule, think about all the elements it will affect — not just the intended one. Consider side effects.
- **Don't rush.** If a change doesn't work, stop and investigate the root cause instead of piling on more overrides.

## Tech stack

- Angular 17, Angular Material 17 (MDC-based), Bootstrap 5, ng-bootstrap
- `@lhncbc/ngx-schema-form` for dynamic forms (sf-form) — 46+ custom widget components
- Google Fonts: Rubik (UI), Unbounded (header), Inter (toggles/radio labels)
- Figma design system colors: #153D8A (primary blue), #77158A (purple), #A8A8A8 (gray), #F3F5F9 (background), #FCF8FF / #EFD8FF (toggle)

## Project structure

- `src/styles.scss` — global style overrides (sf-form widgets, mat-form-field, item component panels)
- `src/styles/colors.scss` — SCSS color variables
- `src/app/base-page/` — main layout with 3-column editor
- `src/app/item/` — tree + item properties (uses mat-sidenav)
- `src/app/lib/widgets/` — all sf-form widget components (label, string, select, boolean-radio, etc.)
- `src/app/form-fields/` — left panel (General information) using sf-form
- `src/app/create-terminology-resources/` — terminology wizard page
