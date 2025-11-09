# Collab Canvas Pro - Design Guidelines

## Design Approach
**Glassmorphism-Based Creative Tool** - Drawing from modern design trends in creative applications like Figma, Miro, and Excalidraw, combined with glassmorphism aesthetic for a contemporary, premium feel.

## Core Design Principles
1. **Floating Interface**: Glassmorphic panels overlay the canvas without obscuring workspace
2. **Tool Accessibility**: All controls within immediate reach, optimized for creative flow
3. **Collaborative Presence**: Visual indicators make collaboration feel alive and interactive

## Typography
- **Primary Font**: Poppins (Google Fonts)
  - Headings: 600 weight
  - UI Labels: 500 weight  
  - Body/Chat: 400 weight
- **Sizing**: Base 14px UI text, 16px chat messages, 12px tooltips

## Layout System
**Spacing Units**: Consistent use of 4, 8, 12, 16, 24 pixel increments (Tailwind equivalents: 1, 2, 3, 4, 6)

**Canvas-Centric Layout**:
- Full viewport canvas background
- Floating toolbar (top-left): 56px height, 16px padding, 12px border-radius
- User list sidebar (right): 280px width, slides in/out, 24px padding
- Chat panel (bottom-right): 320px width × 400px height, expandable/collapsible
- Status bar (bottom): 48px height showing room info and user count

## Component Architecture

### Primary Toolbar (Horizontal)
Glassmorphic container with backdrop-blur effect:
- Tool buttons: 44px × 44px rounded squares, 8px gap between items
- Icons: 20px size, centered in buttons
- Dividers: 1px vertical lines, 32px height between tool groups
- Button groups: [Drawing Tools] | [Size/Color] | [History] | [Actions]
- Hover states: Subtle scale (1.05) and background opacity shift

### Drawing Controls
- **Color Picker**: 44px circular button showing current color, opens popover
- **Brush Size Slider**: 140px width, custom track with circular thumb (16px)
- **Tool Toggles**: Pencil, Eraser with active state highlighting

### Collaboration UI
**User List Sidebar**:
- User cards: 48px height, 12px padding, shows color dot + username
- Animated presence indicators: 8px pulsing dots
- Connection status badge at top

**Live Cursors**:
- Custom cursor SVG: 16px × 16px pointer with username label
- Username tag: 8px offset, small pill background, 11px text
- Smooth position interpolation (100ms transitions)

**Chat Panel**:
- Message bubbles: 12px border-radius, 8px padding
- Own messages: Align right with user's color accent
- Others' messages: Align left with sender color dot
- Input field: 40px height, rounded corners, send button integrated
- Timestamp: 10px text, subtle opacity

### Action Controls
- **Invite Link Button**: Primary glassmorphic button, 120px width, shows "🔗 Invite"
- **Export PNG**: Download button with save icon, 100px width
- **Undo/Redo**: Icon-only buttons, 36px × 36px, disabled state when unavailable
- **Clear Canvas**: Danger-styled button, confirmation modal on click

### Modal System
**Invite Link Modal**:
- Centered overlay: 440px width, 240px height
- Large clickable link display with copy button
- QR code section (160px × 160px) for mobile sharing
- Close button (top-right corner)

## Responsive Breakpoints
**Desktop (1024px+)**: Full layout as described
**Tablet (768px-1023px)**: 
- Compact toolbar, smaller buttons (36px)
- Chat becomes bottom drawer (full width)
- User list becomes top-right dropdown

**Mobile (<768px)**:
- Bottom toolbar (full width, 2 rows if needed)
- Hamburger menu consolidates secondary controls
- Chat/users accessed via bottom sheet overlay
- Larger touch targets (48px minimum)

## Interaction Patterns
- **Drawing**: Immediate feedback, no lag indicators
- **Tool Switching**: Instant, keyboard shortcuts displayed in tooltips
- **Invite Flow**: One-click copy, success toast notification
- **Collaboration Join**: Smooth fade-in of new user cursors

## Glassmorphism Treatment
- **Background blur**: backdrop-filter: blur(12px)
- **Panel opacity**: 0.85-0.95 for foreground panels
- **Border treatment**: 1px subtle borders on glassmorphic elements
- **Shadows**: Multi-layer soft shadows for depth (0 4px 24px, 0 2px 8px)

## Accessibility
- Keyboard navigation for all tools (B=brush, E=eraser, Ctrl+Z=undo, etc.)
- High contrast mode option in settings
- Focus indicators: 2px offset outline
- Screen reader labels for all icon-only buttons
- Minimum touch target: 44px × 44px

This design creates a premium collaborative drawing experience that feels both professional and playful, with glassmorphism elevating the interface while maintaining functional clarity.