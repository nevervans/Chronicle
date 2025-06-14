# Chronicle Historical Timeline Game

## Overview

Chronicle is a daily historical timeline puzzle game where players arrange historical events in chronological order. The application features a React frontend with a Node.js/Express backend, using PostgreSQL for data storage and Drizzle ORM for database operations.

## System Architecture

The application follows a monorepo structure with separate client and server directories, sharing common code through a shared module.

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (@tanstack/react-query) for server state and React hooks for local state
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Style**: REST API with JSON responses
- **Development**: Hot reload with tsx for development server

## Key Components

### Game Logic
- **Daily Events**: Deterministic seeded random selection of 6 historical events per day
- **Timeline Validation**: Client-side validation of chronological order
- **Statistics Tracking**: Local storage for player statistics and streaks
- **Drag & Drop**: HTML5 drag and drop API for event positioning

### Data Layer
- **Database**: PostgreSQL with Drizzle ORM for persistent storage
- **Schema**: Events table with id, name, and year fields
- **Storage**: DatabaseStorage class with 150+ historical events
- **Initialization**: Automatic database seeding from JSON data on startup
- **Migrations**: Drizzle push for schema management

### UI Components
- **Game Board**: Main game interface with drag-and-drop timeline
- **Event Cards**: Draggable historical event components
- **Timeline Slots**: Drop zones for organizing events chronologically
- **Modals**: Statistics and results display modals
- **Responsive Design**: Mobile-first responsive layout

## Data Flow

1. **Game Initialization**: Frontend fetches daily events from `/api/events/daily`
2. **Event Selection**: Backend generates deterministic daily events based on date seed
3. **Player Interaction**: Users drag events to timeline positions
4. **Validation**: Client validates chronological order and tracks attempts
5. **Statistics**: Results stored in localStorage and displayed in modals
6. **Game Completion**: Success/failure state with sharing capabilities

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Query)
- UI components (@radix-ui/* for accessibility)
- Styling (Tailwind CSS, class-variance-authority, clsx)
- Form handling (react-hook-form, @hookform/resolvers)
- Date utilities (date-fns)
- Routing (wouter)

### Backend Dependencies
- Express.js for HTTP server
- Drizzle ORM with PostgreSQL adapter (@neondatabase/serverless)
- Development tools (tsx, esbuild)
- Session management (connect-pg-simple)

### Development Tools
- TypeScript for type safety
- Vite for frontend bundling
- ESBuild for backend bundling
- Replit-specific plugins for development environment

## Deployment Strategy

### Development
- **Environment**: Replit with Node.js 20, Web, and PostgreSQL 16 modules
- **Hot Reload**: Vite dev server with backend proxy
- **Database**: PostgreSQL instance with Drizzle migrations
- **Port Configuration**: Development server on port 5000

### Production
- **Build Process**: Vite builds frontend to `dist/public`, ESBuild bundles backend
- **Deployment Target**: Autoscale deployment on Replit
- **Environment Variables**: DATABASE_URL for PostgreSQL connection
- **Static Serving**: Express serves built frontend assets in production

### Database Management
- **Schema**: Defined in `shared/schema.ts` with Drizzle ORM
- **Migrations**: Generated and applied via `drizzle-kit`
- **Connection**: Uses Neon serverless PostgreSQL adapter
- **Data**: Historical events stored as JSON and loaded into database

## Changelog
- June 14, 2025: Initial setup with React frontend and Express backend
- June 14, 2025: Redesigned to Wordle-style minimalist black UI with vertical event layout
- June 14, 2025: Added PostgreSQL database integration with 150+ historical events

## User Preferences

Preferred communication style: Simple, everyday language.