
## Project Overview

This is a personal portfolio website built with Next.js (React 19) and Tailwind CSS. The site showcases projects with a modern, animated interface featuring theme switching and image modals.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint
```

## Architecture

The app uses a component-based architecture with centralized state management via React Context:

-   **[app/page.jsx](app/page.jsx)** - Main page containing project data and layout structure
-   **[src/context/PortfolioContext.jsx](src/context/PortfolioContext.jsx)** - Global state management via `usePortfolio()` hook
-   **[src/components/](src/components/)** - Individual UI components:
    -   `Header.jsx` - Header with theme toggle
    -   `About.jsx` - Biography section with confetti effect
    -   `ProjectCard.jsx` - Reusable project display with image carousel
    -   `SocialLinks.jsx` - Social media links sidebar
    -   `ImageModal.jsx` - Full-screen image viewer
    -   `Loader.jsx` - Loading animation

See [docs/architecture.md](docs/architecture.md) for detailed implementation specifics (state management, theme system, loading animation timing, etc.).

