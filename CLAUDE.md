# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a YouTube video idea tracker application built with TanStack Start (React), allowing users to submit, vote on, and browse video ideas for Web Dev Cody's channel. The app features real-time updates, tag-based filtering, and Google OAuth authentication.

## Development Commands

### Database Management
- `npm run db:up` - Start PostgreSQL database via Docker Compose
- `npm run db:down` - Stop the database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database with initial data
- `npm run db:reset` - Clear, migrate, and seed the database
- `npm run db:studio` - Open Drizzle Studio for database inspection
- `npm run db:generate` - Generate new migrations from schema changes
- `npm run db:push` - Push schema changes directly to database

### Development Workflow
- `npm run dev` - Start development server (includes `db:up`)
- `npm run build` - Build for production and run TypeScript type checking
- `npm run start` - Start production server

### Setup Requirements
1. `npm i`
2. `docker compose up` (or `npm run db:up`)
3. `npm run db:migrate`
4. `npm run dev`

## Architecture Overview

### Tech Stack
- **Frontend**: TanStack Start (React-based full-stack framework)
- **Routing**: TanStack Router with file-based routing
- **Data Fetching**: TanStack Query with server functions
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with Google OAuth
- **Styling**: Tailwind CSS with ShadCN/UI components
- **Forms**: React Hook Form with Zod validation
- **Real-time**: Server-Sent Events (SSE)

### Project Structure
- `src/routes/` - File-based routing with TanStack Router
  - `-components/` - Route-specific components
  - `-fn/` - Server functions for data fetching/mutations
  - `-hooks/` - Custom React Query hooks
- `src/db/` - Database schema, migrations, and utilities
- `src/components/` - Shared UI components (mostly ShadCN)
- `src/lib/` - Shared utilities and configurations
- `src/utils/` - Authentication and other utilities

### Database Schema
Core entities: `user`, `idea`, `upvote`, `tag`, `ideaTag` (junction table)
- Users can create ideas and upvote others' ideas
- Ideas can have multiple tags via junction table
- Proper indexing on foreign keys and composite queries
- Uses Drizzle ORM with relational queries

### Data Fetching Pattern
All data operations use TanStack Query with server functions:
- Server functions in `src/routes/-fn/` (e.g., `getIdeasFn.ts`, `createIdeaFn.ts`)
- Custom hooks in `src/routes/-hooks/` wrap these with useQuery/useMutation
- Real-time updates via SSE for tag changes

### Authentication
- Better Auth with Google OAuth integration
- Session management with PostgreSQL storage
- Auth client configured in `src/lib/auth-client.ts`
- Server-side auth utilities in `src/utils/auth.ts`

## Development Guidelines

### Package Management
Always use `npm` - never use bun, pnpm, or yarn.

### Components
Use ShadCN/UI components first before implementing custom components. Check `src/components/ui/` for available components.

### Forms
- Use React Hook Form with Zod validation for all forms
- Implement client-side validation
- Show loading spinners in buttons during form submission

### Data Operations
- Always use useQuery for data fetching
- Always use useMutation for data mutations
- Server functions should be in `src/routes/-fn/` directory
- Custom hooks should wrap server functions in `src/routes/-hooks/`

### Styling
- All pages must support both light and dark modes
- Never hardcode colors - use Tailwind CSS theme variables
- Follow existing component patterns for consistency
- For buttons that need purple gradient styling, first define common styles in `tailwind.config.mjs` and `src/styles/app.css`, then add variants to `src/components/ui/button.tsx` to support the purple gradient look

### Real-time Features
The app uses Server-Sent Events for real-time tag updates. See `src/hooks/useServerEvents.ts` and the `/api/events` endpoint.