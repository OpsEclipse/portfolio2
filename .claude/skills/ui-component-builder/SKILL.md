---
name: ui-component-builder
description: Guidelines for creating new React UI components following portfolio conventions.
---

# UI Component Builder

## File Location & Naming

- Place all components in `src/components/`
- Use PascalCase: `ComponentName.jsx`
- One component per file with `export default`

## Component Structure

```jsx
import { useState, useEffect } from 'react';
import { IconName } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const ComponentName = ({ prop1, prop2 }) => {
    const { isLoaded, theme } = usePortfolio();

    return (
        <div className="...">
            {/* content */}
        </div>
    );
};

export default ComponentName;
```

## Typography Scale

Use fixed pixel sizes for consistent typography:

| Size | Mobile | Desktop (sm:) | Usage |
|------|--------|---------------|-------|
| Tiny | `text-[9px]` | `text-[10px]` | Tags, labels |
| Small | `text-[10px]` | `text-[11px]` | Captions, pills |
| Body | `text-[11px]` | `text-[12px]` | Body text |
| Subhead | `text-[14px]` | `text-[16px]` | Subheadings |
| Title | `text-lg` | `text-xl` | Main headings |

## Color Classes (Theme-Aware)

Always use these Tailwind classes mapped to CSS variables:

- **Text**: `text-text-primary`, `text-text-secondary`, `text-text-muted`
- **Background**: `bg-bg`, `bg-surface`, `bg-pill-bg`
- **Border**: `border-border`, `border-border/50`
- **Accent**: `text-accent`, `bg-accent`, `decoration-accent`

## Loading Animation Pattern

Animate entry based on `isLoaded` state with staggered delays:

```jsx
<div className={`transition-all duration-700 delay-100 ${
    isLoaded
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-8'
}`}>
```

Delay values: `delay-100`, `delay-200`, `delay-300` for stagger effect.

## Hover & Interaction Patterns

```jsx
// Standard hover transition
className="transition-all duration-300 hover:scale-[1.05]"

// Link hover
className="hover:underline underline-offset-2 decoration-border"

// Button/pill hover
className="hover:bg-pill-bg/80 transition-colors"

// Image hover with overlay
className="group-hover/image:scale-110 transition-transform duration-500"
```

## Pill/Tag Component Pattern

```jsx
<div className="w-fit h-fit flex gap-2 rounded-full border px-4 py-2 bg-pill-bg">
    <p className="text-[11px] sm:text-[12px] font-medium leading-none text-text-secondary">
        Content
    </p>
</div>
```

## Responsive Breakpoints

Mobile-first approach using Tailwind's `sm:` prefix (640px):

```jsx
// Gap
className="gap-4 sm:gap-6"

// Padding
className="px-4 sm:px-5"

// Layout
className="flex flex-col sm:flex-row"

// Icon size
className="w-3 h-3 sm:w-4 sm:h-4"
```

## Icons (Lucide React)

```jsx
import { ArrowUpRight, ChevronLeft } from 'lucide-react';

// Inline with text
<ArrowUpRight size={12} className="sm:w-[14px] sm:h-[14px] text-text-muted" />

// Button icon
<Icon size={16} />
```

## Available Animations

Defined in `index.css`:

- `animate-fade-in` - Simple opacity fade (0.2s)
- `animate-scale-in` - Scale + opacity (0.3s)
- `animate-slide-in-right` - Slide from right (0.3s)

## Context Usage

Access global state via `usePortfolio()`:

```jsx
const {
    isLoaded,        // Boolean: loading complete
    theme,           // 'light' | 'dark'
    changeTheme,     // Function: toggle theme
    imagePopup,      // Function: open image modal
} = usePortfolio();
```

## Checklist for New Components

1. [ ] File in `src/components/` with PascalCase name
2. [ ] Uses `usePortfolio` for theme/loading state if needed
3. [ ] All colors use theme-aware classes (not hardcoded)
4. [ ] Typography uses fixed pixel scale
5. [ ] Responsive with `sm:` breakpoint variants
6. [ ] Entry animation tied to `isLoaded` state
7. [ ] Hover states use `transition-all duration-300`
8. [ ] Default export at file end
