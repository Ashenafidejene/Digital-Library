const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

console.log('🚀 Starting Simple Backend Server on port', PORT);

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Simple Backend Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Mock books data
const mockBooks = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    category: 'Fiction',
    publisher: 'Scribner',
    publicationDate: '1925-04-10',
    pages: 180,
    language: 'English',
    bookNumber: 'BK-001',
    shelfNumber: 'A-1-001',
    location: 'A-1-001',
    totalCopies: 5,
    availableCopies: 3,
    borrowedCopies: 2,
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

// Books management endpoints
app.get('/api/v1/admin/books', (req, res) => {
  console.log('📥 Admin books request');
  res.json({
    success: true,
    data: mockBooks
  });
});

app.post('/api/v1/admin/books', (req, res) => {
  const bookData = req.body;
  console.log('📥 Add book request:', bookData);

  // Validate required fields
  if (!bookData.title || !bookData.author || !bookData.category) {
    return res.status(400).json({
      success: false,
      message: 'Title, Author, and Category are required fields'
    });
  }

  res.json({
    success: true,
    message: 'Book added successfully',
    data: {
      id: Date.now().toString(),
      ...bookData,
      availableCopies: bookData.availability?.availableCopies || bookData.totalCopies || 1,
      borrowedCopies: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    }
  });
});

// Auth endpoints
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('📥 Login request:', email);

  if (email === 'admin@yekalibrary.gov.et' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          name: 'System Administrator',
          email: 'admin@yekalibrary.gov.et',
          role: 'admin',
          status: 'active'
        },
        tokens: {
          accessToken: 'mock-access-token-admin',
          refreshToken: 'mock-refresh-token-admin'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Yeka Library Backend Server Started!`);
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📚 API available at: http://localhost:${PORT}/api/v1`);
  console.log(`\n📱 Demo Accounts:`);
  console.log(`   Admin: admin@yekalibrary.gov.et / admin123`);
  console.log(`\n🔧 CORS enabled for all origins`);
  console.log(`✅ Server ready to accept connections!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});
