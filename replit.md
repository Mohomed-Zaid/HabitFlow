# HabitFlow - AI-Powered Habit Building App

## Overview

HabitFlow is a comprehensive wellness and habit-building application that combines modern web technologies with AI-powered insights to help users develop and maintain healthy habits. The app provides personalized habit tracking, smart reminders, progress analytics, and gamification elements to encourage consistent behavior change. Built with a mobile-first approach, it features clean design patterns inspired by productivity leaders like Notion and wellness apps like Headspace.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and component-based architecture
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **Design System**: Custom design tokens with light/dark theme support, calming sage green primary colors
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript throughout the entire stack for consistency and type safety
- **Build System**: Vite for fast development and optimized production builds
- **Module System**: ES modules with modern JavaScript features

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Design**: Relational model with users, habits, habit_entries, ai_nudges, and user_stats tables
- **Database Provider**: Neon serverless PostgreSQL for scalable cloud hosting
- **Migrations**: Drizzle Kit for database schema management and version control

### Component Architecture
- **UI Components**: Radix UI primitives wrapped with custom styling for accessibility
- **Layout System**: Mobile-first responsive design with bottom navigation for mobile, sidebar for desktop
- **Card-Based Interface**: Habit cards, AI nudge cards, and stats cards for modular content display
- **Data Visualization**: Recharts library for progress tracking with line charts, bar charts, and heat maps

### External Dependencies

- **UI Library**: Radix UI for accessible, unstyled components (@radix-ui/react-*)
- **Icons**: Lucide React for consistent iconography
- **Database**: Neon PostgreSQL (@neondatabase/serverless)
- **ORM**: Drizzle ORM with PostgreSQL adapter
- **Validation**: Zod for runtime type checking and schema validation
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Charts**: Recharts for data visualization components
- **Date Handling**: date-fns for date manipulation and formatting
- **Development**: Vite with React plugin and TypeScript support
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

The application follows a clean separation of concerns with shared schema definitions, component-based architecture, and a focus on user experience through thoughtful design and AI-enhanced interactions.