<p align="center">
  <img src="FrontEnd/public/favicon.svg" alt="TaskFlow icon" width="96" height="96" />
</p>

# TaskFlow

**What am I working on? What needs doing? When am I doing it? What matters today?**

A full-stack workspace app: a React 19 frontend and a NestJS API, with Kanban tasks, projects, a schedule, and a daily focus view.

## Screenshots

### Login

![Login screen](<README Asset/Login.png>)

### Sign up

![Sign up screen](<README Asset/Signup.png>)

### My Tasks (Kanban)

![Kanban board](<README Asset/Dashboard.png>)

### My Day

![My Day view](<README Asset/MyDay.png>)

### Projects

![Projects view](<README Asset/Projects.png>)

### Schedule

![Schedule view](<README Asset/Schedule.png>)

### Admin

![Admin dashboard](<README Asset/Admin.png>)

## Workspace model

TaskFlow is organised around four questions, each with its own view:

| View | Question it answers |
| ---- | ------------------- |
| **Projects** | What am I working on? |
| **My Tasks** | What needs doing? |
| **Schedule** | When am I doing it? |
| **My Day** | What matters today? |

The Kanban board is the tasks engine. Projects, Schedule, and My Day read the same task data and present it differently, rather than duplicating it.

## Features

- Kanban board with drag and drop between To do, In Progress, and Done (moving a card to Done completes it and sets progress to 100%)
- Task modal with title, description, status, priority, progress, due date, category, and tags
- Search, status filter, category filter, tag filter, and sorting on the toolbar
- Categories and tags management
- Projects with statuses (active, completed, archived), search, filtering, and progress
- Schedule view with day and week modes
- My Day: today's tasks, progress, priority, overdue, timeline, and quick add
- Authentication: register, login, refresh tokens, forgot/reset password, change password
- Admin dashboard with user list, todo statistics, and enable/disable actions
- Light and dark themes driven by CSS variables (follows the OS on load, with a manual toggle)

## Technologies

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui + Base UI, TanStack Query, React Router, dnd-kit, anime.js, date-fns
- **Backend:** NestJS, Prisma, PostgreSQL
- **Authentication:** JWT access/refresh tokens
- **Documentation:** Swagger/OpenAPI
- **Testing:** Vitest, React Testing Library, Supertest

## Project Structure

```text
TaskFlow/
  FrontEnd/      React application
  Backend/       NestJS API
  README Asset/  Screenshots used in this README
```

## Prerequisites

- Node.js
- npm
- PostgreSQL

## Backend Setup

```powershell
cd Backend
npm install
Copy-Item .env.example .env
```

Set `DATABASE_URL` and a production `JWT_SECRET` in `Backend/.env`.

Run migrations and start the API:

```powershell
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

Backend URLs:

```text
API base:   http://localhost:3000/api/v1
Swagger UI: http://localhost:3000/api/docs
```

## Frontend Setup

```powershell
cd FrontEnd
npm install
Copy-Item .env.example .env
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

The frontend reads `VITE_API_BASE_URL`, which points at the versioned API:

```dotenv
VITE_API_BASE_URL="http://localhost:3000/api/v1"
```

## Environment Variables

Backend variables are documented in `Backend/.env.example`; the frontend uses `FrontEnd/.env.example`.

Never commit real secrets or production credentials.

## Database and Migrations

Prisma schema:

```text
Backend/prisma/schema.prisma
```

Development:

```powershell
cd Backend
npx prisma migrate dev
```

Production:

```powershell
cd Backend
npx prisma migrate deploy
```

## Running Tests

Backend:

```powershell
cd Backend
npm test
npm run test:e2e
```

Frontend:

```powershell
cd FrontEnd
npm test
```

## API Documentation

Swagger/OpenAPI documentation is available at:

```text
http://localhost:3000/api/docs
```

All API routes are versioned under `/api/v1`.

## Security and Production Practices

- Consistent global error handling
- DTO validation and unknown-field rejection
- Environment-based configuration
- Structured JSON logging
- Helmet security headers
- CORS allowlist
- Rate limiting
- Secure password hashing
- Role-based admin authorization
- User-scoped resource ownership checks

## More Documentation

- [Frontend README](FrontEnd/README.md)
- [Backend README](Backend/README.md)
