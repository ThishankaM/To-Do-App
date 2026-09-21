<p align="center">
  <img src="public/favicon.svg" alt="TaskFlow icon" width="96" height="96" />
</p>

# TaskFlow Frontend

The React client for TaskFlow: a workspace app that answers *what am I working on?*, *what needs doing?*, *when am I doing it?*, and *what matters today?*

## Screenshots

### Login

![Login screen](<../README Asset/Login.png>)

### Sign up

![Sign up screen](<../README Asset/Signup.png>)

### My Tasks (Kanban)

![Kanban board](<../README Asset/Dashboard.png>)

### My Day

![My Day view](<../README Asset/MyDay.png>)

### Projects

![Projects view](<../README Asset/Projects.png>)

### Schedule

![Schedule view](<../README Asset/Schedule.png>)

### Admin

![Admin dashboard](<../README Asset/Admin.png>)

## Features

- **Kanban board** (`/tasks`) with drag and drop between To do, In Progress, and Done. Dropping a card into Done marks it complete and sets progress to 100%
- **Task modal** with title, description, status, priority, progress, due date, category, and tags
- **Toolbar** with debounced search, status/category/tag filters, sorting, and a theme toggle
- **Organizer** for creating, renaming, and deleting categories and tags
- **Projects** (`/projects`) with statuses (active, completed, archived), search, filtering, progress, and a project card grid
- **My Day** (`/my-day`): today's tasks, today's progress, priority list, overdue count, timeline, focus card, and quick add
- **Schedule** (`/schedule`): day and week views built from scheduled and due dates
- **Authentication**: register, login, refresh-token retry, forgot/reset password, and change password
- **Admin** (`/admin`, ADMIN role only): user list with todo statistics and enable/disable actions
- **Theming**: light and dark palettes from CSS variables, following the OS on load with a manual toggle

## Routes

| Route | View |
| ----- | ---- |
| `/login` | `AuthPage` (login) |
| `/forgot-password` | `AuthPage` (forgot password) |
| `/reset-password` | `AuthPage` (reset password) |
| `/tasks` | `MyTasksView` - Kanban board |
| `/projects` | `ProjectsView` |
| `/schedule` | `ScheduleView` |
| `/my-day` | `MyDayView` |
| `/admin` | `AdminPage` - requires the ADMIN role |
| `/` and unknown paths | Redirect to `/tasks` (or `/login` when signed out) |

The workspace views are nested inside the Dashboard layout, so the sidebar, toolbar, and right-hand panel stay mounted while only the content area changes.

## Tech Stack

- React 19 and TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui primitives backed by Base UI
- TanStack Query for server state
- React Router
- dnd-kit (`@dnd-kit/react`) for drag and drop
- anime.js for the auth page animations
- date-fns for date handling
- lucide-react icons
- Vitest and React Testing Library

## Getting Started

Prerequisites: Node.js, npm, and the TaskFlow backend running on `http://localhost:3000`.

```powershell
cd FrontEnd
npm install
Copy-Item .env.example .env
npm run dev
```

Open:

```text
http://localhost:5173
```

The frontend reads the API base URL from `VITE_API_BASE_URL`:

```dotenv
VITE_API_BASE_URL="http://localhost:3000/api/v1"
```

Make sure the backend CORS configuration allows the Vite origin.

## Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build |
| `npm test` | Run the test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage |

## Data Layer

`src/services/api-client.ts` is a small `fetch` wrapper that:

- attaches the `Authorization: Bearer <token>` header from `tokenStorage`
- retries a request once after a `401` by calling `/auth/refresh`, using a single-flight queue so concurrent 401s share one refresh
- throws a typed `ApiError` (status, message, validation details) on failure
- signs the user out when the session cannot be recovered

Hooks such as `use-todos-query`, `use-taxonomy-query`, and `use-projects` wrap TanStack Query around those services; the earlier `use-todos` and `use-taxonomy` hooks remain for the views that still use local state.

## Project Structure

```text
FrontEnd/
  public/
    favicon.svg
  src/
    components/
      my-day/        quick-add-task, today-progress, priority-tasks, focus-card, today-timeline, today-task-list
      projects/      ProjectCard, ProjectModal
      states/        empty-state, error-state, loading-state
      ui/            shadcn/Base UI primitives (button, dialog, select, ...)
      views/         my-tasks-view, my-day-view, projects-view, schedule-view, coming-soon-view
      ChangePasswordModal.tsx
      OrganizerModal.tsx
      ProjectPanel.tsx
      TaskCard.tsx
      TodoModal.tsx
      kanban-column.tsx
      nav-item.tsx
      task-sidebar.tsx
      task-toolbar.tsx
    hooks/
      use-auth-form.ts
      use-mobile.ts
      use-projects.ts
      use-taxonomy.ts
      use-taxonomy-query.ts
      use-theme.ts
      use-todos.ts
      use-todos-query.ts
    lib/
      query-client.ts
      token-storage.ts
      utils.ts
    pages/
      dashboard/DashboardLayout.tsx
      AdminPage.tsx
      AuthPage.tsx
      Dashboard.tsx
    providers/
      auth-context.ts
      auth-provider.tsx
    services/
      api-client.ts
      auth-api.ts
      project-api.ts
      taxonomy-api.ts
      todo-api.ts
    types/
      api.ts
      auth.ts
      project.ts
      todo.ts
      views.ts
    test/
      setup.ts
    App.tsx
    index.css
    main.tsx
    protected-route.tsx
```

## Key Modules

| Module | Responsibility |
| ------ | -------------- |
| `App` | Router, lazy-loaded routes, and the auth provider |
| `DashboardLayout` | Workspace shell: sidebar, toolbar, right panel, modals, `<Outlet />` |
| `MyTasksView` | Kanban board with drag and drop |
| `MyDayView` | Today's progress, priority, focus, timeline, and quick add |
| `ProjectsView` | Project grid with search and status filtering |
| `ScheduleView` | Day and week schedule |
| `TaskCard` | Draggable task card with a details menu |
| `TodoModal` | Create and edit dialog |
| `ProjectPanel` | Right-hand calendar and project summary |
| `AuthProvider` | User session, `/auth/me`, and the global 401 handler |

## Theming

The palette lives in `src/index.css` as CSS variables: `:root` holds the light theme and `.dark` holds the dark theme, and `@theme inline` maps them to Tailwind utilities such as `bg-card`, `border-border`, and `text-muted-foreground`.

Components never hardcode colours; they use semantic tokens only. `useTheme` reads `prefers-color-scheme` on load and the toolbar toggle switches light and dark for the session, so refreshing re-syncs with the operating system. A small script in `index.html` applies the theme before React mounts to avoid a flash.

## Testing

```powershell
npm test
```

Tests live next to the components they cover (`TaskCard.test.tsx`, `TodoModal.test.tsx`, `task-toolbar.test.tsx`, `AuthPage.test.tsx`, `states.test.tsx`). `src/test/setup.ts` provides the jsdom shims the UI needs (`matchMedia`, `localStorage`, `ResizeObserver`).
