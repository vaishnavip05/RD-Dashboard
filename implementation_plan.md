# Redesign Visual Appearance of R&D Portal

This plan details the visual redesign of the R&D Portal based on the inspiration from the IQAC portal, specifically updating the color palette, typography, and component styling while leaving all data, logic, architecture, and behavior unchanged.

## User Review Required
> [!IMPORTANT]
> Please review this plan to ensure the visual changes align with your expectations. No functional logic or data will be altered. 
> The redesign will specifically target CSS variables, font families, and some inline styles to match the requested palette.

## Open Questions
- Is a solid header background preferred (`#123B6D`), or should we keep a subtle gradient using the Primary and Secondary blues (`#123B6D` to `#1E5AA8`)? (We will default to a subtle gradient for a polished look if no preference is given).
- Are there any specific border-radius preferences beyond a clean, consistent rounding (e.g., matching the current 12px-14px)?

## Proposed Changes

### CSS & Styling

#### [MODIFY] `styles.css`
- **Typography:** Update Google Fonts import to use `Inter`. Update font-family rules to prioritize `Inter, sans-serif`.
- **CSS Variables:** Update color tokens to match the requested palette:
  - `--ink`: `#172033`
  - `--muted`: `#64748B`
  - `--canvas`: `#F5F7FA`
  - `--nav`: `#123B6D`
  - `--gold`: `#D6A84F`
  - `--blue`: `#1E5AA8`
- **Header:** Update `.site-header` gradient to use `#123B6D` and `#1E5AA8`.
- **Cards/Metrics:** Update borders, shadows, and hover states to be softer and more institutional. Apply `#1E5AA8` and `#D6A84F` for accents instead of the previous varied borders.
- **Tables & Filterbars:** Update headers and inputs to align with the cleaner, more muted look.

#### [MODIFY] `sidebar.css`
- **Colors & Accents:** Update sidebar styling to use the new Primary Navy (`#123B6D`) and Secondary Blue (`#1E5AA8`) for active states, headers, and badges.
- **Typography:** Update to `Inter`.
- **Hover/Selection:** Adjust hover backgrounds and selection borders to match the new color scheme.

#### [MODIFY] `login.css`
- **Typography:** Update font imports and families to `Inter`.
- **Colors:** Match the root variables to `styles.css` updates. Update the `.card-header` and `.login-btn` gradients to the new primary/secondary blues.

### HTML Structure (Inline Styles)

#### [MODIFY] `index.html`
- Update inline styles (e.g., on the `#logout-btn` and `#user-bar-info`) to match the new typography and spacing requirements, if necessary. No DOM structure or scripts will be changed.

#### [MODIFY] `login.html` (if any inline styles exist)
- Update any inline styling to align with the new theme.

## Verification Plan

### Automated Tests
- N/A (Visual changes only)

### Manual Verification
- Review the `index.html` dashboard visually in the browser.
- Check that the header, sidebar, cards, and tables reflect the new color palette and typography.
- Verify that `login.html` reflects the updated styles.
- Ensure that clicking through the dashboard and interacting with filters still functions exactly as before.
