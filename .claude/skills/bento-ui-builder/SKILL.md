---
name: bento-ui-builder
description: Specializes in React 19 components with a minimalist "Bento Box" grid and Tailwind CSS.
---
# Bento UI Builder
## Design Standards
1. **The Grid:** Use `grid-cols-2` for mobile and `grid-cols-4` for desktop.
2. **Hover Effects:** Apply `transition-all duration-300 hover:scale-[1.05] hover:z-10`.
3. **Image Logic:** Utilize React 19's preloading for album art. Reference the `images[]` array from the `music_cache` JSONB.
4. **Theme Sync:** Ensure all colors use CSS variables (`var(--bg-primary)`) to follow the `data-theme` system in `index.css`.