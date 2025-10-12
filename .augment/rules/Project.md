---
type: "manual"
---

🛠 AI Assistance Rules for Digital Library Project

This document defines guidelines and rules for using AI assistants (Copilot, ChatGPT, or other tools) when contributing to the Digital Library System. Following these rules will ensure consistent, maintainable, and secure code.

1. General Rules

Always follow the project folder structure:

Backend: backend/src

Frontend: frontend/pages, frontend/components, frontend/services

Use camelCase for variables and PascalCase for React components.

Keep functions small and modular. Each API call or component should have a single responsibility.

Include comments for all complex logic.

Do not modify existing functionality unless required for a new feature.

Always consider security, especially for authentication, authorization, and database operations.

2. Backend Rules

Use Express + Node.js for API routes.

Use MongoDB Atlas for data storage with Mongoose schemas.

Protect routes with JWT authentication.

Role-based access:

Admin: full access to books, bookings, clearance, and reports.

User: can book books, request clearance, and view own borrowings.

Follow the API design plan in PROJECT.md exactly for route names, methods, and request/response structure.

Always validate request bodies and parameters.

Send meaningful error messages with proper HTTP status codes.

3. Frontend Rules

Use Next.js for pages and React components.

Use Axios (or fetch) for API calls with proper Authorization headers.

Keep User and Admin pages separate under pages/:

User: /books, /profile

Admin: /admin/books, /admin/bookings, /admin/reports, /admin/clearance

Reuse components wherever possible (e.g., BookCard, BookingForm).

Show real-time status for borrowed books, deadlines, and notifications.

Follow state management rules using React Context or hooks:

Keep auth state in context/AuthContext.

Keep borrowed books and bookings in separate context if needed.

4. AI Usage Guidelines

When generating code, always respect the existing folder structure.

Do not generate routes, components, or API calls outside the defined API plan.

Ensure security best practices:

Never expose JWT secret in frontend.

Validate all inputs from users.

Include inline comments for AI-generated code.

For UI components:

Use Tailwind CSS (or your chosen styling system).

Follow responsive design principles.

Before accepting AI suggestions:

Check for consistency with role-based access rules.

Verify variable and function names match project conventions.

Ensure API calls match endpoints and expected parameters.

5. Documentation & Comments

Every new feature should include:

Updated section in PROJECT.md.

Optional code snippet example.

Include purpose comments in functions/components, e.g.,

// Function to fetch all available books for the logged-in user


Always log errors to console or error-handling system (backend and frontend).

This file ensures AI assistants work effectively and safely, while keeping your project organized, consistent, and secure.