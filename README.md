# Vue Dashboard — Панneau Control Panel

## Overview

A modern, responsive dashboard application built with **Vue 3**, **Vite** (a web-based IDE framework), and **Pinia** for state management. The project provides a full-featured admin panel with authentication, data visualization, and interactive UI components.

## Features

### Authentication System
- Login page with email/password validation
- JWT token storage in `localStorage`
- Route guards that redirect unauthenticated users to `/login`
- Protected routes that require valid tokens
- Logout functionality that clears stored credentials

### Dashboard Layout
- **Header**: Logo, search bar (with mobile toggle), notification badge, and user profile avatar
- **Sidebar**: Collapsible navigation menu with active state highlighting
- **Main Content Area**: Responsive grid layout with multiple content sections

### Dashboard Components
1. **Welcome Banner** — Gradient-stopped hero section with call-to-action button
2. **Statistics Cards** — Four stat cards displaying metrics (users, revenue, orders, conversion rate) with trend indicators (positive/negative change badges)
3. **Activity Timeline** — Vertical timeline showing recent system events with timestamps
4. **Quick Actions Panel** — Action buttons for creating projects, uploading files, and inviting collaborators
5. **Data Table** — Virtualized table component (`DataTable.vue`) supporting:
   - 100,000 rows of mock data
   - Column sorting
   - Custom cell renderers (tooltips, growth tags, status badges)

### UI Components
- `ModalWindow` — Draggable modal dialog with custom slots for content and footer buttons
- `Button` — Loading state indicator with spinner animation
- `DataTable` — High-performance virtualized table for large datasets
- Custom directive: `vTooltip` for hover tooltips

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Vue 3 (Composition API) |
| Build Tool | Vite |
| Routing | vue-router |
| State Management | Pinia |
| Icons | Custom SVG icons (`components/icons/`) |

## Project Structure

```
src/
├── assets/          # Static images and media
├── components/        # Reusable UI components
│   ├── icons/           # Icon SVGs (imported as Vue components)
│   ├── DataTable.vue    # Virtualized table component
│   └── ModalWindow.vue  # Draggable modal dialog
├── directives/          # Custom Vue directives
│   └── vTooltip.js      # Tooltip directive implementation
├── stores/            # Pinia state stores
│   └── auth.js           # Authentication store (login/logout/token)
├── views/             # Page components
│   ├── Main.vue         # Dashboard home page
│   ├── Login.vue        # Authentication form
│   └── NotFound.vue     # 404 error page
└── router/            # Vue Router configuration
    └── index.js         # Route definitions and navigation guards
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser.

### Default Login Credentials
- **Email**: `admin@example.com`
- **Password**: `123456`

## Design Notes

- CSS custom properties (`--primary`, `--bg-main`, etc.) define the design system tokens
- The layout uses CSS Grid and Flexbox for responsive behavior
- Media queries at 900px and 640px breakpoints handle tablet/mobile adaptations
- The sidebar collapses to a compact icon-only view when toggled
