# Developer Toolkit

## Overview

The Developer Toolkit is a comprehensive web application that provides advanced utility tools for developers, including cryptographic hashing (MD5, SHA-256, SHA-512, SHA-3), encryption/decryption algorithms, JSON/XML formatting and validation, file conversion (PDF to text, DOCX processing), multiple encoding/decoding formats (Base64, Base32, URL, HTML entities, JWT), QR code generation and scanning, duplicate data identification, and other data processing utilities. The application features a modern card-based interface and is built as a full-stack solution with a React frontend and Express backend, designed to handle both synchronous operations and asynchronous file processing tasks.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript and follows a component-based architecture:
- **UI Framework**: Uses shadcn/ui components built on top of Radix UI primitives for consistent, accessible UI components
- **Styling**: Tailwind CSS for utility-first styling with custom CSS variables for theming
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
The server is built with Express.js and follows a RESTful API pattern:
- **Framework**: Express.js with TypeScript for type safety
- **File Processing**: Supports asynchronous file operations with job tracking for PDF and document conversion
- **Request Handling**: Custom middleware for logging, JSON parsing, and error handling
- **Storage Pattern**: Abstracted storage interface supporting both in-memory and database implementations
- **Development Setup**: Hot reload with Vite middleware integration for seamless development

### Data Storage Solutions
The application uses a flexible storage architecture:
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL for cloud database hosting
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Caching Strategy**: In-memory caching for cryptocurrency rates with 5-minute expiration
- **Job Tracking**: Database-backed job system for async file processing operations

### Authentication and Authorization
Currently, the application operates without authentication mechanisms, focusing on utility functionality. The session infrastructure is prepared with connect-pg-simple for future implementation.

### API Design Patterns
- **RESTful Endpoints**: Standard HTTP methods for resource manipulation
- **Async Job Pattern**: POST requests create jobs, GET requests check status for long-running operations
- **Error Handling**: Centralized error middleware with structured error responses
- **Response Caching**: Strategic caching for external API calls (cryptocurrency data)

## External Dependencies

### Third-Party Services
- **CoinGecko API**: Cryptocurrency price data and conversion rates with optional API key support
- **Neon Database**: Serverless PostgreSQL hosting platform

### Key Libraries and Frameworks
- **UI Components**: Radix UI primitives for accessible component foundation
- **File Processing**: pdf-parse for PDF text extraction, mammoth for DOCX processing
- **Validation**: Zod for runtime type validation and schema definition
- **HTTP Client**: Native fetch API with custom request wrapper
- **Development Tools**: tsx for TypeScript execution, esbuild for production builds

### Build and Development Dependencies
- **Bundling**: Vite for frontend, esbuild for backend production builds
- **TypeScript**: Full TypeScript support across frontend, backend, and shared modules
- **CSS Processing**: PostCSS with Tailwind CSS and autoprefixer
- **File Uploads**: multer for handling multipart form data
- **Code Quality**: ESM modules throughout the application stack