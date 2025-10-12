# 🏛️ Yeka Sub City Library - Complete Digital Library System

A modern, full-stack digital library management system built with Node.js, React, TypeScript, and MongoDB. Features real-time updates, comprehensive admin dashboard, user management, and bilingual support (English/Amharic).

## 🌟 Features Overview

### 🎨 **Modern Frontend (React + TypeScript)**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: System preference detection with manual toggle
- **Bilingual Support**: English and Amharic with complete translations
- **Real-time Updates**: Socket.IO integration for live notifications
- **Authentication**: JWT-based auth with protected routes
- **Admin Dashboard**: Comprehensive management interface
- **User Dashboard**: Personal library management (under maintenance)

### 🚀 **Robust Backend (Node.js + Express)**
- **RESTful API**: Complete CRUD operations for all resources
- **Authentication**: JWT tokens with refresh token support
- **Real-time Features**: Socket.IO for live updates
- **Database**: MongoDB with Mongoose ODM
- **Security**: Rate limiting, CORS, input validation
- **File Uploads**: Multer integration for book covers
- **Email System**: Nodemailer for notifications

### 📊 **Admin Features**
- **Dashboard**: Real-time statistics and charts
- **Book Management**: Add, edit, delete, and categorize books
- **User Management**: Member accounts and permissions
- **Borrowing System**: Track loans, returns, and overdue items
- **Analytics**: Usage statistics and reporting
- **Notifications**: System-wide announcements

### 👥 **User Features**
- **Book Catalog**: Advanced search and filtering
- **Events**: Library events and programs
- **Profile Management**: Personal account settings
- **Borrowing History**: Track borrowed books
- **Notifications**: Real-time updates on book status

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB
- Git

### 1. **Backend Setup**
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and other settings

# Start development server
npm run dev
```

### 2. **Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 3. **Access Application**
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Socket.IO Test**: http://localhost:3000/socket-test.html

## 📱 **Demo Accounts**

### Admin Account
- **Email**: admin@yekalibrary.gov.et
- **Password**: admin123
- **Access**: Full admin dashboard and management features

### User Account
- **Email**: user@example.com
- **Password**: user123
- **Access**: User features (dashboard under maintenance)

## 🎯 **Key Features Implemented**

### ✅ **Authentication System**
- JWT-based authentication with refresh tokens
- Protected routes for admin and user areas
- Login/Register pages with validation
- Password hashing with bcrypt

### ✅ **Book Management**
- Complete CRUD operations
- Advanced search and filtering
- Category management
- Availability tracking
- File upload for book covers

### ✅ **Real-time Features**
- Socket.IO integration
- Live notifications
- Real-time dashboard updates
- Connection status monitoring

### ✅ **Admin Dashboard**
- Statistics overview with charts
- Book management interface
- User management (basic)
- Recent activity feed
- Responsive design

### ✅ **User Interface**
- Modern, responsive design
- Dark/light mode toggle
- Bilingual support (English/Amharic)
- Smooth animations with Framer Motion
- Accessible design patterns

## 🛠️ **Technology Stack**

### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.IO
- **Validation**: Joi
- **File Upload**: Multer
- **Email**: Nodemailer

### **Frontend**
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Chart.js
- **Icons**: Heroicons
- **HTTP Client**: Axios
- **Routing**: React Router
- **Internationalization**: React i18next

## 📖 **API Documentation**

### **Authentication Endpoints**
```
POST /api/v1/auth/register    # User registration
POST /api/v1/auth/login       # User login
POST /api/v1/auth/refresh     # Refresh token
POST /api/v1/auth/logout      # User logout
GET  /api/v1/auth/profile     # Get user profile
```

### **Book Endpoints**
```
GET    /api/v1/books          # Get all books
GET    /api/v1/books/:id      # Get book by ID
POST   /api/v1/books          # Create book (Admin)
PUT    /api/v1/books/:id      # Update book (Admin)
DELETE /api/v1/books/:id      # Delete book (Admin)
GET    /api/v1/books/search   # Search books
```

### **User Endpoints**
```
GET    /api/v1/users          # Get all users (Admin)
GET    /api/v1/users/:id      # Get user by ID
PUT    /api/v1/users/:id      # Update user
DELETE /api/v1/users/:id      # Delete user (Admin)
```

## 🔮 **Planned Features**

### 📋 **User Dashboard** (Under Development)
- Personal borrowing history
- Book recommendations
- Reading progress tracking
- Notification preferences
- Account management

### 📚 **Enhanced Book Features**
- Book reviews and ratings
- Reading lists and favorites
- Book reservations
- Digital book support

### 👥 **Advanced User Management**
- Member profiles
- Borrowing limits
- Fine management
- Membership types

### 📊 **Analytics & Reporting**
- Usage statistics
- Popular books tracking
- Member activity reports
- Export functionality

## 🚀 **Deployment**

### **Backend Deployment**
1. Set up MongoDB Atlas cluster
2. Configure environment variables
3. Deploy to Heroku, Railway, or similar
4. Set up domain and SSL

### **Frontend Deployment**
1. Build the React application
2. Deploy to Netlify, Vercel, or similar
3. Configure environment variables
4. Set up custom domain

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 **Support**

For support and questions:
- **Email**: info@yekalibrary.gov.et
- **Phone**: +251 11 123 4567
- **Address**: Yeka Sub City, Addis Ababa, Ethiopia

---

**Built with ❤️ for the Yeka Sub City Library community**
