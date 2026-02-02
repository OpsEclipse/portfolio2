
## Project Overview

This is a personal portfolio website built with React 19, Vite, and Tailwind CSS. The site showcases projects, experience, and education with a modern, animated interface featuring theme switching and image modals.

## Development Commands

```bash
# Start development server (default port 5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint

# Deploy to GitHub Pages
npm run deploy  # Runs build then publishes to gh-pages branch
```

## Architecture

The app uses a component-based architecture with centralized state management via React Context:

-   **[src/App.jsx](src/App.jsx)** - Main component containing project data and layout structure
-   **[src/context/PortfolioContext.jsx](src/context/PortfolioContext.jsx)** - Global state management via `usePortfolio()` hook
-   **[src/components/](src/components/)** - Individual UI components:
    -   `Header.jsx` - Header with theme toggle
    -   `About.jsx` - Biography section with confetti effect
    -   `ProjectCard.jsx` - Reusable project display with image carousel
    -   `Selector.jsx` - View toggle (Projects/Experience)
    -   `Experience.jsx` - Professional experience cards
    -   `Education.jsx` - Academic background
    -   `SocialLinks.jsx` - Social media links sidebar
    -   `ImageModal.jsx` - Full-screen image viewer
    -   `Loader.jsx` - Loading animation

See [docs/architecture.md](docs/architecture.md) for detailed implementation specifics (state management, theme system, loading animation timing, etc.).


