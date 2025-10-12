const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

console.log('Starting Yeka Library Backend Server...');

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

console.log('Middleware configured');

// Mock data
const mockBooks = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    category: 'Fiction',
    description: 'A classic American novel set in the Jazz Age.',
    publisher: 'Scribner',
    publicationDate: '1925-04-10',
    pages: 180,
    language: 'English',
    location: 'A-1-001',
    status: 'available',
    availability: {
      totalCopies: 5,
      availableCopies: 3,
      borrowedCopies: 2
    },
    rating: 4.2,
    tags: ['classic', 'american', 'jazz-age'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '9780061120084',
    category: 'Fiction',
    description: 'A gripping tale of racial injustice and childhood innocence.',
    publisher: 'J.B. Lippincott & Co.',
    publicationDate: '1960-07-11',
    pages: 281,
    language: 'English',
    location: 'A-1-002',
    status: 'available',
    availability: {
      totalCopies: 4,
      availableCopies: 2,
      borrowedCopies: 2
    },
    rating: 4.5,
    tags: ['classic', 'social-justice', 'coming-of-age'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '9780141439518',
    category: 'Romance',
    description: 'A witty and romantic novel about love and social class.',
    publisher: 'Penguin Classics',
    publicationDate: '1813-01-28',
    pages: 432,
    language: 'English',
    location: 'B-2-001',
    status: 'borrowed',
    availability: {
      totalCopies: 3,
      availableCopies: 1,
      borrowedCopies: 2
    },
    rating: 4.3,
    tags: ['classic', 'romance', 'british'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockUsers = [
  {
    id: '1',
    name: 'System Administrator',
    email: 'admin@yekalibrary.gov.et',
    role: 'admin',
    status: 'active',
    joinDate: new Date().toISOString()
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'user@example.com',
    role: 'user',
    status: 'active',
    joinDate: new Date().toISOString()
  }
];

console.log('Mock data loaded');

// Routes
app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.json({
    success: true,
    message: 'Yeka Sub City Library API',
    version: '1.0.0',
    endpoints: {
      books: '/api/v1/books',
      auth: '/api/v1/auth',
      users: '/api/v1/users'
    }
  });
});

// Auth routes
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, password });
  
  if (email === 'admin@yekalibrary.gov.et' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: mockUsers[0],
        tokens: {
          accessToken: 'mock-access-token-admin',
          refreshToken: 'mock-refresh-token-admin'
        }
      }
    });
  } else if (email === 'user@example.com' && password === 'user123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: mockUsers[1],
        tokens: {
          accessToken: 'mock-access-token-user',
          refreshToken: 'mock-refresh-token-user'
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

app.post('/api/v1/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    role: 'user',
    status: 'active',
    joinDate: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Registration successful',
    data: {
      user: newUser,
      tokens: {
        accessToken: 'mock-access-token-new',
        refreshToken: 'mock-refresh-token-new'
      }
    }
  });
});

app.get('/api/v1/auth/profile', (req, res) => {
  res.json({
    success: true,
    data: mockUsers[0]
  });
});

app.get('/api/v1/auth/verify', (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid'
  });
});

// Books routes
app.get('/api/v1/books', (req, res) => {
  console.log('Books endpoint accessed with query:', req.query);
  const { search, category, page = 1, limit = 12 } = req.query;
  let filteredBooks = [...mockBooks];
  
  if (search) {
    filteredBooks = filteredBooks.filter(book => 
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (category) {
    filteredBooks = filteredBooks.filter(book => book.category === category);
  }
  
  res.json({
    success: true,
    data: filteredBooks,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: 1,
      totalItems: filteredBooks.length,
      hasNext: false,
      hasPrev: false
    }
  });
});

app.get('/api/v1/books/categories', (req, res) => {
  console.log('Categories endpoint accessed');
  const categories = [...new Set(mockBooks.map(book => book.category))];
  res.json({
    success: true,
    data: categories
  });
});

app.get('/api/v1/books/:id', (req, res) => {
  const book = mockBooks.find(b => b.id === req.params.id);
  if (book) {
    res.json({
      success: true,
      data: book
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }
});

// Users routes
app.get('/api/v1/users', (req, res) => {
  res.json({
    success: true,
    data: mockUsers
  });
});

console.log('Routes configured');

app.listen(PORT, () => {
  console.log(`\n🚀 Yeka Sub City Library Backend Server Started!`);
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📚 API available at: http://localhost:${PORT}/api/v1`);
  console.log(`\n📱 Demo Accounts:`);
  console.log(`   Admin: admin@yekalibrary.gov.et / admin123`);
  console.log(`   User:  user@example.com / user123`);
  console.log(`\n🎯 Next Step: Start frontend with "cd frontend && npm start"`);
  console.log(`   Frontend will be available at: http://localhost:3001`);
});
