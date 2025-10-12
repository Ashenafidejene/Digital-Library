# Digital Library Backend

A comprehensive digital library backend system built with Node.js, Express, MongoDB Atlas, and TypeScript following Clean Architecture principles.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Registration, login, profile management
- **Book Management**: CRUD operations, search, categorization
- **Booking System**: Request/approve workflow with real-time updates
- **Admin Panel**: User management, book management, booking oversight
- **Real-time Updates**: WebSocket support via Socket.IO
- **API Documentation**: Swagger/OpenAPI documentation
- **Testing**: Comprehensive unit tests with Jest
- **Production Ready**: Security, logging, rate limiting

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **MongoDB Atlas** account (or local MongoDB instance)

### Installing Node.js

1. **Windows**: Download from [nodejs.org](https://nodejs.org/) and run the installer
2. **macOS**: Use Homebrew: `brew install node` or download from nodejs.org
3. **Linux**: Use your package manager or download from nodejs.org

Verify installation:
```bash
node --version
npm --version
```

## Quick Start

1. **Clone and Setup**
   ```bash
   cd "Digital library"
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB Atlas connection string and other configs
   ```

3. **MongoDB Atlas Setup**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get connection string and update `MONGODB_URI` in `.env`

4. **Development**
   ```bash
   npm run dev
   ```

5. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
src/
├── config/          # Database and app configuration
├── controllers/     # Request handlers
├── services/        # Business logic
├── repositories/    # Data access layer
├── entities/        # Domain models and schemas
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
├── routes/          # API routes
└── tests/           # Test files
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `GET /api/v1/users/bookings` - Get user bookings

### Books
- `GET /api/v1/books` - Get all books (with search/filter)
- `GET /api/v1/books/:id` - Get book by ID
- `POST /api/v1/books` - Create book (admin)
- `PUT /api/v1/books/:id` - Update book (admin)
- `DELETE /api/v1/books/:id` - Delete book (admin)

### Bookings
- `POST /api/v1/bookings` - Create booking request
- `GET /api/v1/bookings` - Get bookings (admin)
- `PUT /api/v1/bookings/:id/approve` - Approve booking (admin)
- `PUT /api/v1/bookings/:id/reject` - Reject booking (admin)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT
