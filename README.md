# Wingstop Inventory App

A comprehensive inventory management system designed for Wingstop restaurant locations. This application helps track, manage, and forecast inventory levels to minimize stock-outs and reduce waste.

## Project Structure

```
Wingstop Inventory App/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API route handlers
│   │   ├── core/           # Core configuration and utilities
│   │   ├── models/         # SQLModel database models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic services
│   ├── alembic/            # Database migrations
│   ├── main.py             # FastAPI application entry point
│   └── requirements.txt    # Python dependencies
├── frontend/               # React.js frontend
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── package.json        # Node.js dependencies
│   └── vite.config.ts      # Vite configuration
├── tasks/                  # Task tracking and documentation
└── WingstopInventoryApp.md # Product Requirements Document
```

## Technology Stack

### Backend
- **Framework**: FastAPI with Python
- **Database ORM**: SQLModel (combines SQLAlchemy + Pydantic)
- **Package Manager**: UV for fast Python dependency management
- **Database**: SQLite for development, PostgreSQL for production
- **Authentication**: JWT tokens with FastAPI security utilities

### Frontend
- **Framework**: React.js with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: Zustand for lightweight state management
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios for API communication

## Getting Started

### Prerequisites
- Python 3.8+ with UV package manager
- Node.js 18+ with npm or yarn
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wingstop-inventory-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   uv sync  # Install Python dependencies
   uv run python main.py  # Start development server
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install  # Install Node.js dependencies
   npm run dev  # Start development server
   ```

## Features

- **Inventory Management**: CRUD operations for inventory items and categories
- **Count Entry**: Mobile-optimized count entry with offline support
- **Forecasting**: Usage-based forecasting with manual override capabilities
- **Multi-location Support**: Compare inventories across locations
- **Reporting**: Comprehensive dashboards and export functionality
- **Scheduling**: Automated reminders and count scheduling
- **Role-based Access**: Secure authentication with role-based permissions

## Development Guidelines

- Follow TypeScript best practices for frontend development
- Use SQLModel for type-safe database operations
- Implement comprehensive error handling and logging
- Write unit tests for critical business logic
- Follow conventional commit format for version control

## License

This project is proprietary software for Wingstop restaurant operations.
