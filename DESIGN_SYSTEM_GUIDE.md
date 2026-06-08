# BeastBuck Design System Guide

**Version:** 2.0  
**Last Updated:** June 7, 2026  
**Status:** Active

---

## Overview

This guide documents the BeastBuck design system, including typography, color palette, spacing, components, and visual patterns. The design system is built to create a premium, world-class experience comparable to Notion, Linear, Discord, and Apple.

---

## Typography System

### Font Families

- **Primary:** Inter (sans-serif) - Used for body text, UI elements, and general content
- **Heading:** Orbitron (sans-serif) - Used for headings, titles, and display text

### Typography Scale

The typography scale provides a consistent hierarchy across all components:

| Size | Class Name | Usage | Line Height | Letter Spacing | Font Weight |
|------|-----------|-------|------------|----------------|-------------|
| 48px | `text-hero` | Hero titles, landing page headers | 1.1 | -0.02em | 700 |
| 36px | `text-page-title` | Page titles, main section headers | 1.2 | -0.01em | 700 |
| 24px | `text-section-title` | Section titles, card headers | 1.3 | 0em | 600 |
| 18px | `text-card-title` | Card titles, widget headers | 1.4 | 0em | 600 |
| 16px | `text-description` | Descriptions, body text | 1.6 | 0em | 400 |
| 14px | `text-caption` | Captions, labels, helper text | 1.5 | 0em | 400 |
| 12px | `text-badge` | Badges, tags, small labels | 1.4 | 0.05em | 500 |
| 32px | `text-metric` | Metrics, numbers, statistics | 1.1 | -0.02em | 700 |

### Typography Usage Guidelines

**Hero Titles (`text-hero`)**
- Landing page headers
- Marketing section headers
- Feature announcements
- Use sparingly - maximum 1-2 per page

**Page Titles (`text-page-title`)**
- Main page headers
- Dashboard titles
- Modal titles
- One per page

**Section Titles (`text-section-title`)**
- Section headers within pages
- Card group headers
- Sub-sections
- Use to organize content

**Card Titles (`text-card-title`)**
- Card headers
- Widget titles
- Panel headers
- Component titles

**Descriptions (`text-description`)**
- Body text
- Paragraphs
- Explanations
- General content

**Captions (`text-caption`)**
- Form labels
- Helper text
- Metadata
- Secondary information

**Badges (`text-badge`)**
- Status badges
- Tags
- Small labels
- Pill buttons

**Metrics (`text-metric`)**
- Statistics
- Numbers
- Data points
- KPIs

---

## Color System

### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#050507` | Main background |
| Surface | `rgba(15, 15, 20, 0.78)` | Card backgrounds, panels |
| Border | `rgba(255, 255, 255, 0.08)` | Default borders |

### Text Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Text (Default) | `#ffffff` | Primary text |
| Text Muted | `#8e8e9f` | Secondary text |
| Text Soft | `#b7b8c7` | Tertiary text |

### Accent Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Accent (Primary) | `#00f0ff` | Primary actions, highlights |
| Accent (Alt) | `#b026ff` | Secondary accents, special features |

### Status Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Success | `#00ff88` | Success states, positive indicators |
| Warning | `#ffaa00` | Warning states, caution |
| Danger | `#ff2a2a` | Error states, destructive actions |

### Border Opacity Scale

| Opacity | Class Name | Usage |
|---------|-----------|-------|
| 10% | `border-white/10` | Default borders, subtle dividers |
| 15% | `border-white/15` | Hover states, active borders |
| 20% | `border-white/20` | Emphasized borders, focus states |

---

## Depth System

The depth system provides visual hierarchy through shadows and elevation:

| Level | Class Name | Usage |
|-------|-----------|-------|
| Level 1 | `shadow-depth-1` | Small cards, list items |
| Level 2 | `shadow-depth-2` | Important cards, panels |
| Level 3 | `shadow-depth-3` | Hero sections, modals |

### Glow Effects

| Effect | Class Name | Usage |
|--------|-----------|-------|
| Glow 1 | `shadow-glow-1` | Subtle glow, hover states |
| Glow 2 | `shadow-glow-2` | Medium glow, active states |
| Glow 3 | `shadow-glow-3` | Strong glow, hero elements |
| Glow Purple | `shadow-glow-purple` | Purple accent glow |
| Glow Success | `shadow-glow-success` | Success state glow |

---

## Premium Gradients

### Main Gradients

| Gradient | Class Name | Usage |
|----------|-----------|-------|
| Cyan to Purple | `bg-gradient-premium-1` | Primary buttons, hero sections |
| Purple to Pink | `bg-gradient-premium-2` | Secondary accents |
| Cyan to Green | `bg-gradient-premium-3` | Success states |
| Green to Orange | `bg-gradient-premium-4` | Warning states |
| Orange to Red | `bg-gradient-premium-5` | Danger states |

### Subtle Gradients

| Gradient | Class Name | Usage |
|----------|-----------|-------|
| Subtle Cyan-Purple | `bg-gradient-subtle-1` | Backgrounds, cards |
| Subtle Purple-Pink | `bg-gradient-subtle-2` | Backgrounds, cards |

---

## Spacing Scale

The spacing scale ensures consistent spacing across all components:

| Value | Tailwind Class | Usage |
|-------|---------------|-------|
| 0.5rem | `gap-2` | Tight spacing, related items |
| 0.75rem | `gap-3` | Default spacing |
| 1rem | `gap-4` | Standard spacing |
| 1.5rem | `gap-6` | Section spacing |
| 2rem | `gap-8` | Large spacing |
| 2.5rem | `gap-10` | Extra large spacing |
| 3rem | `gap-12` | Section breaks |
| 4rem | `gap-16` | Major sections |
| 4.5rem | `gap-18` | Hero spacing |
| 5.5rem | `gap-22` | Landing sections |
| 6.5rem | `gap-26` | Large sections |
| 7.5rem | `gap-30` | Extra large sections |

---

## Animation System

### Timing Functions

| Timing | Class Name | Usage |
|--------|-----------|-------|
| Premium | `ease-premium` | Default animations, smooth transitions |
| Bounce Smooth | `ease-bounce-smooth` | Micro-interactions, playful elements |

### Animations

| Animation | Class Name | Duration | Usage |
|-----------|-----------|----------|-------|
| Float | `animate-float` | 6s | Floating elements, hero icons |
| Pulse Slow | `animate-pulse-slow` | 4s | Loading states, indicators |
| Shimmer | `animate-shimmer` | 2s | Skeleton loaders, loading bars |

### Transition Durations

| Duration | Class Name | Usage |
|----------|-----------|-------|
| 150ms | `duration-150` | Micro-interactions |
| 200ms | `duration-200` | Default transitions |
| 300ms | `duration-300` | Card hover, button states |
| 500ms | `duration-500` | Page transitions |

---

## Component Guidelines

### Cards

**Base Card:**
```jsx
<Card depth={1} hoverable={false}>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Depth Levels:**
- `depth={1}` - Small cards, list items
- `depth={2}` - Important cards, panels
- `depth={3}` - Hero sections, modals

**Hoverable:**
- `hoverable={true}` - Adds hover effects (lift, glow)

### Buttons

**Primary Button:**
```jsx
<Button variant="primary" size="md" loading={false}>
  Click Me
</Button>
```

**Variants:**
- `primary` - Main actions, CTAs
- `secondary` - Secondary actions
- `danger` - Destructive actions
- `ghost` - Minimal actions

**Sizes:**
- `sm` - Small buttons
- `md` - Default buttons
- `lg` - Large buttons

**States:**
- `loading={true}` - Shows loading spinner
- `disabled` - Disabled state

### Inputs

**Base Input:**
```jsx
<Input
  label="Label"
  helperText="Helper text"
  error="Error message"
  success="Success message"
  loading={false}
  icon={Icon}
/>
```

**States:**
- `error` - Error state with red border
- `success` - Success state with green border
- `loading` - Loading state with spinner

### Empty States

**Pre-configured Empty States:**
```jsx
<CreateFirstProject onCreate={handleCreate} />
<CreateFirstVenture onCreate={handleCreate} />
<CreateFirstAI onCreate={handleCreate} />
<UploadFirstMovie onUpload={handleUpload} />
<StartResearch onStart={handleStart} />
<PublishKnowledge onPublish={handlePublish} />
<JoinCommunity onJoin={handleJoin} />
<StartCollaboration onStart={handleStart} />
```

**Custom Empty State:**
```jsx
<EmptyState
  icon={Icon}
  title="Title"
  description="Description"
  action={<Button>Action</Button>}
  gradient={true}
/>
```

### Skeleton Loaders

**Card Skeleton:**
```jsx
<CardSkeleton />
```

**Dashboard Card Skeleton:**
```jsx
<DashboardCardSkeleton />
```

**Table Skeleton:**
```jsx
<TableSkeleton rows={5} columns={4} />
```

**List Skeleton:**
```jsx
<ListSkeleton items={5} />
```

---

## Layout Patterns

### Page Structure

```jsx
<PageContainer>
  <PageHeader title="Title" description="Description" action={action} />
  <SectionWrapper title="Section Title" action={action}>
    {/* Content */}
  </SectionWrapper>
</PageContainer>
```

### Grid Layouts

**Standard Grid:**
```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>
```

**Responsive Grid:**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Items */}
</div>
```

---

## Accessibility Guidelines

### Touch Targets

- Minimum touch target: 44px × 44px
- All buttons and interactive elements must meet this requirement
- Use `min-h-[44px]` class

### Focus States

- All interactive elements must have visible focus states
- Use `focus:ring-2 focus:ring-accent/20` for focus indicators
- Ensure focus order is logical

### Color Contrast

- Text must have minimum 4.5:1 contrast ratio
- Large text (18px+) must have minimum 3:1 contrast ratio
- Use WCAG AA compliant color combinations

### ARIA Labels

- All icons must have `aria-hidden="true"` if decorative
- Interactive elements must have descriptive labels
- Use `aria-label` for icon-only buttons

---

## Best Practices

### 1. Consistency

- Use the typography scale for all text
- Use the spacing scale for all spacing
- Use the depth system for all elevation
- Use the color system for all colors

### 2. Hierarchy

- Use hero titles sparingly (1-2 per page)
- Use page titles once per page
- Use section titles to organize content
- Use card titles for component headers

### 3. Animation

- Use smooth transitions (200-300ms)
- Avoid jarring animations
- Use the premium timing function
- Ensure animations are performant (60fps)

### 4. Mobile

- Ensure all touch targets are 44px minimum
- Test on mobile breakpoints (320px, 375px, 414px)
- Use responsive grids
- Optimize for touch interactions

### 5. Performance

- Use `React.memo` for expensive components
- Use lazy loading for routes
- Use code splitting for large bundles
- Optimize images and assets

---

## Migration Guide

### Old → New Typography

| Old Class | New Class |
|-----------|-----------|
| `text-3xl` | `text-page-title` |
| `text-xl` | `text-section-title` |
| `text-lg` | `text-card-title` |
| `text-base` | `text-description` |
| `text-sm` | `text-caption` |
| `text-xs` | `text-badge` |

### Old → New Borders

| Old Class | New Class |
|-----------|-----------|
| `border-border` | `border-white/10` |
| `border-white/5` | `border-white/10` |
| `border-gray-*` | `border-white/10` |

### Old → New Shadows

| Old Class | New Class |
|-----------|-----------|
| `shadow-xl` | `shadow-depth-2` |
| `shadow-lg` | `shadow-depth-1` |
| `shadow-md` | `shadow-depth-1` |

---

## Resources

### Component Library

- `src/components/ui/Card.jsx` - Card component
- `src/components/ui/Button.jsx` - Button component
- `src/components/ui/Input.jsx` - Input component
- `src/components/ui/EmptyState.jsx` - Empty state component
- `src/components/ui/Skeleton.jsx` - Skeleton loader component
- `src/components/ui/DashboardCard.jsx` - Dashboard card component
- `src/components/ui/UIElements.jsx` - UI elements (PageHeader, LoadingState)
- `src/components/layout/LayoutWrappers.jsx` - Layout wrappers
- `src/components/layout/Sidebar.jsx` - Sidebar navigation
- `src/components/layout/Topbar.jsx` - Top navigation bar

### Configuration

- `tailwind.config.js` - Tailwind CSS configuration with design tokens

---

## Changelog

### Version 2.0 (June 7, 2026)
- Added typography scale with 8 levels
- Added depth system with 3 levels
- Added border opacity scale (10%, 15%, 20%)
- Added premium gradients (5 main, 2 subtle)
- Added spacing scale (18 levels)
- Added animation system (timing functions, animations)
- Upgraded all core components to use new design system
- Added skeleton loader components
- Added premium empty state components
- Added input validation states
- Added button loading states

### Version 1.0 (Previous)
- Initial design system
- Basic color palette
- Basic typography
- Basic components

---

## Support

For questions or issues with the design system, contact the design team or create an issue in the repository.

---

**Note:** This guide is a living document and will be updated as the design system evolves.
