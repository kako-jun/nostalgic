# DESIGN.md — nostalgic (1997-Style Web Tools Platform)

## 1. Visual Theme

A web tools platform faithfully recreating the look and feel of 1997-era websites. Beveled 3D borders, gray system chrome, marquee scrolling, blink animations, and tiled background patterns. The aesthetic is not ironic — it is a genuine recreation of the Windows 95/98 desktop browser experience, applied as a functional tools platform.

## 2. Color Palette

| Token | Value | Usage |
|---|---|---|
| `white` | `#ffffff` | Content area backgrounds, button highlights |
| `gray` | `#808080` | Desktop background, muted borders |
| `silver` | `#c0c0c0` | Window chrome, toolbars, secondary buttons |
| `black` | `#000000` | Text, window borders, shadows |
| `green` | `#ccffcc` | Accent background — success, highlights |
| `yellow` | `#ffff00` | Marquee text background |
| `link` | `#0000ee` | Unvisited hyperlinks |
| `visited` | `#551a8b` | Visited hyperlinks |
| `btn-primary` | `#2196F3` | Primary action buttons |
| `btn-warning` | `#FF9800` | Warning action buttons |
| `btn-danger` | `#F44336` | Destructive action buttons |
| `btn-secondary` | `#c0c0c0` | Secondary/cancel buttons |
| `terminal-bg` | `#000000` | JSON terminal background |
| `terminal-text` | `#00ff00` | JSON terminal text (green-on-black) |

## 3. Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| All text | `"BIZ UDGothic", "MS Gothic", monospace` | 14px base | 400 |
| Headings | Same stack | 16–20px | 700 |
| Marquee | Same stack | 14px | 700 |
| Terminal | Same stack | 13px | 400 |

BIZ UDGothic is loaded from Google Fonts. The monospace stack ensures the retro bitmap-font feel persists even if the web font fails to load. No sans-serif or serif fonts are used anywhere.

## 4. Component Stylings

### 3D Beveled Borders (Outset — Raised)
```
border: 2px outset #c0c0c0;
```
Used for: buttons (default state), toolbars, raised panels.

### 3D Beveled Borders (Inset — Sunken)
```
border: 2px inset #c0c0c0;
```
Used for: text inputs, text areas, sunken content wells.

### Double-Line Borders
```
border: 3px double #000000;
```
Used for: section dividers, important content frames.

### Dotted Background Pattern
- `background-image` with small repeating dot pattern
- Low contrast against `#808080` or `#c0c0c0` base

### Marquee
- `animation: marquee-scroll 20s linear infinite`
- Horizontal text scrolling from right to left
- Yellow background highlight

### Blink Animation
- `animation: blink 1s step-start infinite`
- Toggles `visibility: hidden / visible`
- Used sparingly for emphasis (as in 1997)

### Buttons
- Background: `silver` default
- Border: `2px outset #c0c0c0`
- Active/pressed: `border: 2px inset #c0c0c0`
- Colored variants use `btn-primary`, `btn-warning`, `btn-danger` backgrounds with white text

### JSON Terminal
- Background: `#000000`
- Text: `#00ff00`
- Font: monospace from main stack
- Border: `2px inset #c0c0c0`
- Padding: 12px

## 5. Layout Principles

- Fixed sidebar: `250px` width on the left, content fills remaining space
- No flexbox or grid for main layout — use floats and fixed widths for authenticity
- Content areas use `<table>` for tabular data (period-appropriate)
- Max-width is not enforced (1997 sites stretched to fill)
- Spacing via margins and padding, typically 8px / 16px increments

## 6. Depth & Elevation

Depth is communicated entirely through beveled borders, not shadows.

| State | Border Style | Effect |
|---|---|---|
| Raised | `2px outset` | Button default, toolbar |
| Sunken | `2px inset` | Input fields, content wells |
| Flat | `1px solid` | Simple dividers |
| Double | `3px double` | Emphasized frames |

No `box-shadow` is used. No `backdrop-filter`. These did not exist in 1997.

## 7. Do's and Don'ts

**Do:**
- Use `outset`/`inset` borders for all 3D effects
- Use `#c0c0c0` silver for window chrome and toolbars
- Use BIZ UDGothic / MS Gothic monospace throughout
- Include marquee scrolling where contextually appropriate
- Use `#0000ee` for links and `#551a8b` for visited links
- Underline all links

**Don't:**
- Use `box-shadow`, `border-radius`, `backdrop-filter`, or CSS gradients
- Use flexbox or CSS grid for primary layout (floats and tables are authentic)
- Use modern sans-serif fonts
- Add smooth transitions or easing — state changes should be instant
- Remove link underlines
- Use opacity for hover effects

## 8. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| > 768px | Fixed 250px sidebar + content area |
| < 768px | Sidebar collapses to hamburger menu, content goes full width |

- Mobile menu replaces the fixed sidebar below 768px
- Marquee continues on all screen sizes
- Tables may scroll horizontally on small screens
- The retro aesthetic is maintained on mobile — no modern concessions

## 9. Agent Prompt Guide

When building new pages or components for nostalgic:

- **Backgrounds**: `#808080` (desktop), `#c0c0c0` (chrome), `#ffffff` (content)
- **All borders**: Use `2px outset` (raised) or `2px inset` (sunken), never `border-radius`
- **All text**: BIZ UDGothic / MS Gothic monospace, no other fonts
- **Links**: Always `#0000ee`, always underlined, visited `#551a8b`
- **Buttons**: Silver `outset` default; primary `#2196F3`, warning `#FF9800`, danger `#F44336`
- **Inputs**: White background, `2px inset` border
- **Terminal sections**: Black bg, green `#00ff00` text, inset border
- **Animations**: Marquee 20s scroll, blink 1s step — no smooth transitions
- **Layout**: 250px fixed sidebar, float-based content, no flexbox/grid
- **No modern CSS**: No shadows, no rounded corners, no gradients, no blur
