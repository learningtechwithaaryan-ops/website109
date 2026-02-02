# Black-Link-Hub

## Overview

Black-Link-Hub is a gaming download hub web application featuring a neon-themed cyberpunk aesthetic. It allows users to browse, search, and download games organized by category (PC, Android, Programs). The application includes authentication via Replit Auth and allows authenticated users to add new games to the catalog.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom neon/cyberpunk theme, CSS variables for theming
- **UI Components**: Shadcn/ui component library (New York style)
- **Animations**: Framer Motion for smooth transitions and hover effects
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints defined in shared routes file with Zod schemas for type-safe request/response validation
- **Authentication**: Replit Auth integration via OpenID Connect

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all database table definitions
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

### Project Structure
```
client/           # React frontend application
  src/
    components/   # UI components including shadcn/ui
    hooks/        # Custom React hooks
    pages/        # Route page components
    lib/          # Utility functions
server/           # Express backend
  replit_integrations/  # Replit Auth integration
shared/           # Shared code between frontend and backend
  schema.ts       # Drizzle database schema
  routes.ts       # API route definitions with Zod schemas
```

### Key Design Patterns
- **Shared Types**: Database schemas and API contracts are defined once in `shared/` and used by both frontend and backend
- **Type-Safe APIs**: Zod schemas validate API inputs and outputs, providing runtime type checking
- **Component Architecture**: Reusable UI components with Radix UI primitives wrapped by Shadcn styling
- **Custom Theming**: Neon cyberpunk aesthetic using CSS custom properties and extended Tailwind config with Orbitron and Rajdhani fonts

### Build System
- **Development**: Vite dev server with HMR for frontend, tsx for backend
- **Production**: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Database Migrations**: Drizzle Kit with `db:push` command

## External Dependencies

### Database Configuration
- **DATABASE_URL**: `postgresql://user:password@localhost:5432/blacklinkhub`
- **SESSION_SECRET**: your_random_long_secret_string
- **PORT**: 5000 (default for both dev and production)

### Deployment Setup
- **Cloudflare Tunnel**: `wardencloud.dpdns.org` (configured via `cloudflared`)
- **Internal IP**: `172.31.83.194`
- **VPS Installation Guide**: See [INSTALL_VPS.md](./INSTALL_VPS.md) for full setup instructions.

### Database
- PostgreSQL database (connection via `DATABASE_URL` environment variable)
- Drizzle ORM for database operations

### Authentication
- Replit Auth (OpenID Connect)
- Requires `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET` environment variables
- Admin Credentials: `aaryabpandey@gmail.com` / `pandeyaarya254` (Login via Replit Auth)

### Third-Party Libraries
- **@tanstack/react-query**: Server state management
- **framer-motion**: Animation library
- **openid-client**: OpenID Connect client for authentication
- **passport**: Authentication middleware
- **zod**: Schema validation

### External Assets
- Google Fonts: Orbitron, Rajdhani, DM Sans, Fira Code, Geist Mono
- Discord CDN for logo image