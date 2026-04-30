# Map Icon System

## Overview

The planning map now features a comprehensive icon system with 18 different marker types to distinguish between various node types, classifications, and infrastructure elements. This provides better visual clarity and helps users quickly identify different elements on the map.

## Icon Types

### Standard Shapes

- **Circle** (`ICON_TYPES.CIRCLE`) - Basic circular marker
- **Square** (`ICON_TYPES.SQUARE`) - Square marker
- **Triangle** (`ICON_TYPES.TRIANGLE`) - Triangular marker pointing up
- **Diamond** (`ICON_TYPES.DIAMOND`) - Diamond/rotated square marker
- **Star** (`ICON_TYPES.STAR`) - 5-pointed star marker
- **Hexagon** (`ICON_TYPES.HEXAGON`) - 6-sided polygon
- **Pentagon** (`ICON_TYPES.PENTAGON`) - 5-sided polygon
- **Octagon** (`ICON_TYPES.OCTAGON`) - 8-sided polygon

### Special Markers

- **Cross** (`ICON_TYPES.CROSS`) - X-shaped marker for warnings or unreliable nodes
- **Plus** (`ICON_TYPES.PLUS`) - Plus sign marker
- **Pin** (`ICON_TYPES.PIN`) - Location pin marker (inverted triangle)
- **Antenna** (`ICON_TYPES.ANTENNA`) - Antenna symbol (tall triangle)
- **Tower** (`ICON_TYPES.TOWER`) - Tower marker
- **Building** (`ICON_TYPES.BUILDING`) - Building marker (square)

### Status Indicators

- **Alert** (`ICON_TYPES.ALERT`) - Alert/warning triangle
- **Warning** (`ICON_TYPES.WARNING`) - Warning octagon (stop sign shape)
- **Check** (`ICON_TYPES.CHECK`) - Success/check pentagon

## Icon Usage by Category

### Repeaters (Classification-Based)

Repeater icons change based on their classification level (0-8):

- **Class 8-7 (Backbone/Very Reliable)**: ⭐ Star - Most important, highest reliability
- **Class 6-5 (Reliable/Good)**: ⬡ Hexagon - Solid performers
- **Class 4-3 (Average/Below Average)**: ⬠ Pentagon - Moderate reliability
- **Class 2-1 (Poor/Very Poor)**: ● Circle - Basic nodes
- **Class 0 (Unreliable)**: ✕ Cross - Problematic nodes

**Color coding**: Blue (best) to orange/brown (worst) using a colorblind-friendly palette.

### Companions

- **Icon**: ◆ Diamond
- **Color**: Cyan (#48cae4) when active, gray (#444) when offline
- **Purpose**: Distinguished from repeaters with unique diamond shape

### Infrastructure (Towers)

Different tower types use distinct icons:

- **Watertoren** (Water Tower): ⬡ Hexagon
- **Zendmast** (Transmission Tower): △ Antenna
- **Kerktoren** (Church Tower): ⭐ Star
- **Flatgebouw** (Apartment Building): ■ Building/Square
- **Schoorsteen** (Chimney): △ Triangle

**Color**: Orange (#ff6b35) when suitable for repeater, gray (#888) otherwise.

### Bewoonde Kernen (Settlements)

Settlement icons vary by population size and type:

- **Stad** (City): ⬢ Octagon - Largest (8 sides)
- **Plaats** (Town): ⬡ Hexagon - Large (6 sides)
- **Dorp** (Village): ⬠ Pentagon - Medium (5 sides)
- **Buurtschap** (Hamlet): ◆ Diamond - Smallest

**Color**: Gradient from amber (cities) to pale yellow (hamlets).

### Status Markers

- **No Coverage**: △ Alert triangle in red - Settlements without network coverage
- **Flash/Search Result**: ⭐ Animated star - Highlights search results with pulsing animation

### Planned Nodes

Planned repeaters use the same icon types as existing repeaters based on their planned classification, but with thicker strokes (2.5px) to indicate they're planned rather than deployed.

## Developer API

### Creating Custom Icons

Use the `createIconStyle()` function:

```javascript
createIconStyle(iconType, color, radius, options)
```

**Parameters:**
- `iconType` (string): Type from ICON_TYPES constant
- `color` (string): Fill color (hex, rgb, or rgba)
- `radius` (number): Size/radius of the icon
- `options` (object): Optional settings
  - `strokeColor` (string): Border color (default: '#fff')
  - `strokeWidth` (number): Border thickness (default: 2)
  - `opacity` (number): Fill opacity 0-1 (default: 1)

**Example:**

```javascript
// Create a blue star icon
const style = createIconStyle(
  ICON_TYPES.STAR,
  '#003f5c',
  10,
  { strokeColor: '#fff', strokeWidth: 2 }
);

// Apply to feature
feature.setStyle(style);
```

### Legacy Compatibility

The old `createNodeStyle()` function is still supported and automatically uses the CIRCLE icon type:

```javascript
createNodeStyle(color, radius) // Returns circle icon
```

### Opacity Support

The system includes automatic color opacity adjustment:

```javascript
// Create semi-transparent icon
createIconStyle(ICON_TYPES.HEXAGON, '#ff0000', 8, { opacity: 0.5 });
```

## Visual Legend

The sidebar includes a comprehensive icon legend showing:

1. **Repeater classifications** - Different shapes for different reliability levels
2. **Other nodes** - Companions and special markers
3. **Infrastructure** - Tower types and buildings
4. **Settlements** - Population-based shapes
5. **Status indicators** - Warnings and alerts

The legend helps users quickly understand what each icon represents without needing to memorize the system.

## Accessibility

- All icons have stroke outlines for contrast
- Colorblind-friendly palette used for classifications
- Icon shapes provide visual distinction independent of color
- Legend provides text descriptions of all icons
- Sufficient size and spacing for touch targets (WCAG AAA)

## Performance

- Icons are rendered using native OpenLayers shapes (not images)
- Vector-based rendering scales smoothly at any zoom level
- No external icon files or fonts required
- Minimal performance impact

## Future Enhancements

Potential additions to the icon system:

- Custom SVG icon support for specialized markers
- User-selectable icon themes
- Animated icons for active transmissions
- 3D icon rendering for enhanced visualization
- Icon rotation based on directional antennas
- Icon clustering for high-density areas

---

**Last Updated**: 2026-04-30  
**Version**: 2.0.0
