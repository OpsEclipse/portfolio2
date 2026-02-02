---
name: architecture-expert
description: Expert on the project's architecture, including component structure, state management (PortfolioContext), and design patterns.
---

# Architecture Expert

## System Overview

This is a personal portfolio SPA built with **React 19**, **Vite**, and **Tailwind CSS**. It relies on a modular component architecture and centralized state management.

## Tech Stack

-   **Core**: React 19.1.1, Vite 7.1.7
-   **Styling**: Tailwind CSS 3.4.18 (Utility-first), PostCSS
-   **State**: React Context API (`PortfolioContext`)
-   **Icons**: Lucide React
-   **Animations**: Canvas Confetti

## Component Architecture

Located in `src/components/`, organized by role:

-   **Layout**: `Header.jsx` (Nav + Theme Toggle), `Selector.jsx` (View Switcher)
-   **Content**: `About.jsx`, `Experience.jsx`, `Education.jsx`, `ProjectCard.jsx`
-   **Utility**: `Loader.jsx` (Initial animation), `ImageModal.jsx` (lightbox)

## State Management (`PortfolioContext`)

The `PortfolioContext` is the single source of truth for:

1. **Theme**: Light/Dark mode (persisted in localStorage).
2. **Loading**: Initial 1400ms loader sequence.
3. **Navigation**: Active view selection (Projects vs Experience).
4. **UI State**: Modals and hover effects.

## Data Flow

-   **Entry**: `main.jsx` -> `App.jsx`
-   **Data Source**: Project data is currently hardcoded in `App.jsx`.
-   **Consumption**: Components consume data via props or `usePortfolio()` hook.

## Key Patterns

-   **Theming**: Uses CSS variables + `data-theme` attribute on `html`.
-   **Performance**: Image preloading in `App.jsx` to prevent flicker.
