const express = require('express');
const cors = require('cors');

// Suppress deprecation warnings
process.noDeprecation = true;

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

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('🔐 Auth check:', {
    authHeader,
    token,
    path: req.path,
    method: req.method
  });

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  // For this demo, we'll accept the mock tokens from login
  const validTokens = [
    'mock-access-token-admin',
    'mock-access-token-user',
    'mock-access-token-new'
  ];

  if (!validTokens.includes(token)) {
    console.log('❌ Invalid token:', token);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }

  // Set user info based on token
  if (token === 'mock-access-token-admin') {
    req.user = {
      id: '1',
      email: 'admin@example.com',
      role: 'admin',
      name: 'Admin User'
    };
  } else if (token === 'mock-access-token-user') {
    req.user = {
      id: '2',
      email: 'user@example.com',
      role: 'user',
      name: 'Regular User'
    };
  } else {
    req.user = {
      id: '3',
      email: 'new@example.com',
      role: 'user',
      name: 'New User'
    };
  }

  console.log('✅ Token valid, user:', req.user);
  next();
};

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    console.log('❌ Admin access required, user role:', req.user?.role);
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  console.log('✅ Admin access granted');
  next();
};

// Test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Simple Backend Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post('/api/v1/auth/login', (req, res) => {
  console.log('📥 Login request received:', req.body);
  
  const { email, password } = req.body;
  
  if (email === 'admin@yekalibrary.gov.et' && password === 'admin123') {
    const response = {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          name: 'System Administrator',
          email: 'admin@yekalibrary.gov.et',
          role: 'admin',
          status: 'active',
          joinDate: new Date().toISOString()
        },
        tokens: {
          accessToken: 'mock-access-token-admin',
          refreshToken: 'mock-refresh-token-admin'
        }
      }
    };
    console.log('✅ Admin login successful');
    res.json(response);
  } else if (email === 'user@example.com' && password === 'user123') {
    const response = {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '2',
          name: 'John Doe',
          email: 'user@example.com',
          role: 'user',
          status: 'active',
          joinDate: new Date().toISOString()
        },
        tokens: {
          accessToken: 'mock-access-token-user',
          refreshToken: 'mock-refresh-token-user'
        }
      }
    };
    console.log('✅ User login successful');
    res.json(response);
  } else {
    console.log('❌ Invalid credentials');
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.post('/api/v1/auth/register', (req, res) => {
  console.log('📥 Register request received:', req.body);
  
  const { name, email, password } = req.body;
  
  const response = {
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: Date.now().toString(),
        name,
        email,
        role: 'user',
        status: 'active',
        joinDate: new Date().toISOString()
      },
      tokens: {
        accessToken: 'mock-access-token-new',
        refreshToken: 'mock-refresh-token-new'
      }
    }
  };
  
  console.log('✅ Registration successful');
  res.json(response);
});

app.get('/api/v1/auth/verify', (req, res) => {
  console.log('📥 Token verification request');
  res.json({
    success: true,
    message: 'Token is valid'
  });
});

// Dashboard data endpoints
app.get('/api/v1/dashboard/overview', (req, res) => {
  console.log('📥 Dashboard overview request');
  res.json({
    success: true,
    data: {
      stats: {
        totalBooks: 1250,
        totalMembers: 340,
        borrowedBooks: 89,
        overdueBooks: 12,
        reservedBooks: 23,
        newMembersThisMonth: 15
      },
      recentActivity: [
        {
          id: '1',
          type: 'borrow',
          user: 'John Doe',
          book: 'The Great Gatsby',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'return',
          user: 'Jane Smith',
          book: 'To Kill a Mockingbird',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'reserve',
          user: 'Mike Johnson',
          book: 'Pride and Prejudice',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ]
    }
  });
});

app.get('/api/v1/dashboard/borrowed-books', (req, res) => {
  console.log('📥 Borrowed books request');
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        borrowerName: 'John Doe',
        borrowerEmail: 'john@example.com',
        borrowerPhone: '+251911234567',
        borrowDate: '2024-01-15',
        dueDate: '2024-02-20',
        status: 'active',
        renewalCount: 1,
        maxRenewals: 2
      },
      {
        id: '2',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780061120084',
        borrowerName: 'Jane Smith',
        borrowerEmail: 'jane@example.com',
        borrowerPhone: '+251922345678',
        borrowDate: '2024-01-10',
        dueDate: '2024-02-15',
        status: 'overdue',
        renewalCount: 0,
        maxRenewals: 2
      },
      {
        id: '3',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        isbn: '9780141439518',
        borrowerName: 'Mike Johnson',
        borrowerEmail: 'mike@example.com',
        borrowerPhone: '+251933456789',
        borrowDate: '2024-01-20',
        dueDate: '2024-02-25',
        status: 'active',
        renewalCount: 0,
        maxRenewals: 2
      }
    ]
  });
});

app.get('/api/v1/dashboard/reserved-books', (req, res) => {
  console.log('📥 Reserved books request');
  res.json({
    success: true,
    data: [
      {
        id: '4',
        title: '1984',
        author: 'George Orwell',
        isbn: '9780451524935',
        reserverName: 'Sarah Wilson',
        reserverEmail: 'sarah@example.com',
        reserverPhone: '+251944567890',
        reservedDate: '2024-02-01',
        estimatedAvailability: '2024-02-28',
        position: 1,
        status: 'ready'
      },
      {
        id: '5',
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        isbn: '9780316769174',
        reserverName: 'Tom Brown',
        reserverEmail: 'tom@example.com',
        reserverPhone: '+251955678901',
        reservedDate: '2024-02-05',
        estimatedAvailability: '2024-03-05',
        position: 2,
        status: 'pending'
      }
    ]
  });
});

app.get('/api/v1/dashboard/reading-history', (req, res) => {
  console.log('📥 Reading history request');
  res.json({
    success: true,
    data: [
      {
        id: '6',
        title: 'The Lord of the Rings',
        author: 'J.R.R. Tolkien',
        isbn: '9780544003415',
        borrowerName: 'Alice Cooper',
        borrowerEmail: 'alice@example.com',
        borrowDate: '2024-01-01',
        returnDate: '2024-01-30',
        rating: 5,
        status: 'completed',
        daysOverdue: 0
      },
      {
        id: '7',
        title: 'Harry Potter and the Sorcerer\'s Stone',
        author: 'J.K. Rowling',
        isbn: '9780439708180',
        borrowerName: 'Bob Davis',
        borrowerEmail: 'bob@example.com',
        borrowDate: '2023-12-15',
        returnDate: '2024-01-20',
        rating: 4,
        status: 'completed',
        daysOverdue: 0
      },
      {
        id: '8',
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        isbn: '9780547928227',
        borrowerName: 'Carol White',
        borrowerEmail: 'carol@example.com',
        borrowDate: '2023-12-01',
        returnDate: '2024-01-10',
        rating: 3,
        status: 'overdue_returned',
        daysOverdue: 5
      }
    ]
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
    description: 'A classic American novel set in the Jazz Age',
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
    tags: ['classic', 'american', 'fiction'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'የሰላም ጉዞ',
    author: 'ዳኛቸው ወርቁ',
    isbn: '9789994450001',
    category: 'Ethiopian Literature',
    description: 'A journey of peace in Ethiopian literature',
    publisher: 'Addis Ababa University Press',
    publicationDate: '2020-05-15',
    pages: 320,
    language: 'Amharic',
    location: 'C-1-001',
    status: 'available',
    availability: {
      totalCopies: 2,
      availableCopies: 2,
      borrowedCopies: 0
    },
    tags: ['ethiopian', 'literature', 'amharic'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935',
    category: 'Science Fiction',
    description: 'A dystopian social science fiction novel',
    publisher: 'Secker & Warburg',
    publicationDate: '1949-06-08',
    pages: 328,
    language: 'English',
    location: 'B-2-001',
    status: 'available',
    availability: {
      totalCopies: 4,
      availableCopies: 2,
      borrowedCopies: 2
    },
    tags: ['dystopian', 'science-fiction', 'political'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Regular Books endpoints (public access)
app.get('/api/v1/books', (req, res) => {
  console.log('📥 Books request with query:', req.query);
  const { search, category, page = 1, limit = 12 } = req.query;
  let filteredBooks = [...mockBooks];

  // Apply search filter
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredBooks = filteredBooks.filter(book =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.isbn.includes(searchTerm) ||
      book.description.toLowerCase().includes(searchTerm)
    );
  }

  // Apply category filter
  if (category && category !== '') {
    filteredBooks = filteredBooks.filter(book => book.category === category);
  }

  // Apply pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedBooks,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredBooks.length / parseInt(limit)),
      totalItems: filteredBooks.length,
      hasNext: endIndex < filteredBooks.length,
      hasPrev: parseInt(page) > 1
    }
  });
});

app.get('/api/v1/books/categories', (req, res) => {
  console.log('📥 Categories request');
  const categories = [...new Set(mockBooks.map(book => book.category))];
  res.json({
    success: true,
    data: categories
  });
});

app.get('/api/v1/books/:id', (req, res) => {
  console.log('📥 Book by ID request:', req.params.id);
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

app.delete('/api/v1/books/:id', (req, res) => {
  const { id } = req.params;
  console.log('📥 Delete book request:', id);

  const bookIndex = mockBooks.findIndex(b => b.id === id);
  if (bookIndex !== -1) {
    mockBooks.splice(bookIndex, 1);
    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }
});

// Admin Books endpoints
app.get('/api/v1/admin/books', (req, res) => {
  console.log('📥 Admin books request with query:', req.query);
  const { search, category, page = 1, limit = 50 } = req.query;
  let filteredBooks = [...mockBooks];

  // Apply search filter
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredBooks = filteredBooks.filter(book =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.isbn.includes(searchTerm) ||
      book.description.toLowerCase().includes(searchTerm)
    );
  }

  // Apply category filter
  if (category && category !== '') {
    filteredBooks = filteredBooks.filter(book => book.category === category);
  }

  res.json({
    success: true,
    data: filteredBooks,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredBooks.length / parseInt(limit)),
      totalItems: filteredBooks.length,
      hasNext: parseInt(page) * parseInt(limit) < filteredBooks.length,
      hasPrev: parseInt(page) > 1
    }
  });
});

// Admin Users endpoints
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+251 91 123 4567',
    role: 'user',
    status: 'active',
    membershipType: 'premium',
    joinDate: '2024-01-15T00:00:00Z',
    lastActive: '2024-08-19T10:00:00Z',
    borrowedBooks: 2,
    totalBorrows: 15,
    overdueBooks: 0,
    pendingBookings: 0,
    clearanceStatus: 'clear'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+251 91 234 5678',
    role: 'user',
    status: 'active',
    membershipType: 'basic',
    joinDate: '2024-02-01T00:00:00Z',
    lastActive: '2024-08-18T09:30:00Z',
    borrowedBooks: 1,
    totalBorrows: 8,
    overdueBooks: 1,
    pendingBookings: 1,
    clearanceStatus: 'blocked'
  },
  {
    id: '3',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '+251 91 345 6789',
    role: 'user',
    status: 'active',
    membershipType: 'student',
    joinDate: '2024-03-10T00:00:00Z',
    lastActive: '2024-08-19T14:20:00Z',
    borrowedBooks: 3,
    totalBorrows: 22,
    overdueBooks: 1,
    pendingBookings: 1,
    clearanceStatus: 'blocked'
  },
  {
    id: '4',
    name: 'Bob Wilson',
    email: 'bob.wilson@example.com',
    phone: '+251 91 456 7890',
    role: 'user',
    status: 'suspended',
    membershipType: 'basic',
    joinDate: '2023-12-15T00:00:00Z',
    lastActive: '2024-08-10T14:20:00Z',
    borrowedBooks: 1,
    totalBorrows: 5,
    overdueBooks: 1,
    pendingBookings: 0,
    clearanceStatus: 'blocked'
  },
  {
    id: '5',
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+251 91 567 8901',
    role: 'admin',
    status: 'active',
    membershipType: 'premium',
    joinDate: '2023-01-01T00:00:00Z',
    lastActive: '2024-08-19T15:00:00Z',
    borrowedBooks: 0,
    totalBorrows: 25,
    overdueBooks: 0,
    pendingBookings: 0,
    clearanceStatus: 'clear'
  }
];

app.get('/api/v1/admin/users', (req, res) => {
  console.log('📥 Admin users request with query:', req.query);
  const { search, role, status, page = 1, limit = 50 } = req.query;
  let filteredUsers = [...mockUsers];

  // Apply search filter
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredUsers = filteredUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  }

  // Apply role filter
  if (role && role !== '') {
    filteredUsers = filteredUsers.filter(user => user.role === role);
  }

  // Apply status filter
  if (status && status !== '') {
    filteredUsers = filteredUsers.filter(user => user.status === status);
  }

  res.json({
    success: true,
    data: filteredUsers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredUsers.length / parseInt(limit)),
      totalItems: filteredUsers.length,
      hasNext: parseInt(page) * parseInt(limit) < filteredUsers.length,
      hasPrev: parseInt(page) > 1
    }
  });
});

app.post('/api/v1/admin/users', (req, res) => {
  const userData = req.body;
  console.log('📥 Add user request:', userData);

  // Validate required fields
  if (!userData.name || !userData.email) {
    return res.status(400).json({
      success: false,
      message: 'Name and Email are required fields'
    });
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name: userData.name,
    email: userData.email,
    phone: userData.phone || '',
    role: userData.role || 'user',
    status: userData.status || 'active',
    membershipType: userData.membershipType || 'basic',
    joinDate: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    borrowedBooks: 0,
    totalBorrows: 0
  };

  // Add to mock users array
  mockUsers.push(newUser);

  res.json({
    success: true,
    message: 'User added successfully',
    data: newUser
  });
});

app.delete('/api/v1/admin/users/:id', (req, res) => {
  const userId = req.params.id;
  console.log('📥 Delete user request:', userId);

  const userIndex = mockUsers.findIndex(user => user.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  mockUsers.splice(userIndex, 1);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// Admin Borrowing endpoints
const mockBorrowingRecords = [
  {
    id: '1',
    userId: '1',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    bookId: '1',
    bookTitle: 'The Great Gatsby',
    bookAuthor: 'F. Scott Fitzgerald',
    status: 'borrowed',
    requestDate: '2024-08-10T00:00:00Z',
    approvedDate: '2024-08-10T10:00:00Z',
    borrowDate: '2024-08-10T10:00:00Z',
    dueDate: '2024-08-24T23:59:59Z',
    renewalCount: 0,
    maxRenewals: 2,
    fineAmount: 0,
    notes: ''
  },
  {
    id: '2',
    userId: '3',
    userName: 'Ahmed Hassan',
    userEmail: 'ahmed.hassan@example.com',
    bookId: '2',
    bookTitle: 'To Kill a Mockingbird',
    bookAuthor: 'Harper Lee',
    status: 'overdue',
    requestDate: '2024-08-01T00:00:00Z',
    approvedDate: '2024-08-01T09:00:00Z',
    borrowDate: '2024-08-01T09:00:00Z',
    dueDate: '2024-08-15T23:59:59Z',
    renewalCount: 1,
    maxRenewals: 2,
    fineAmount: 6.0,
    notes: 'Overdue by 3 days'
  },
  {
    id: '3',
    userId: '1',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    bookId: '3',
    bookTitle: '1984',
    bookAuthor: 'George Orwell',
    status: 'pending',
    requestDate: '2024-08-18T08:00:00Z',
    renewalCount: 0,
    maxRenewals: 2,
    fineAmount: 0,
    notes: 'Waiting for approval'
  }
];

app.get('/api/v1/admin/borrowing', (req, res) => {
  console.log('📥 Admin borrowing request with query:', req.query);
  const { search, status, page = 1, limit = 50 } = req.query;
  let filteredRecords = [...mockBorrowingRecords];

  // Apply search filter
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredRecords = filteredRecords.filter(record =>
      record.userName.toLowerCase().includes(searchTerm) ||
      record.bookTitle.toLowerCase().includes(searchTerm) ||
      record.bookAuthor.toLowerCase().includes(searchTerm)
    );
  }

  // Apply status filter
  if (status && status !== '') {
    filteredRecords = filteredRecords.filter(record => record.status === status);
  }

  res.json({
    success: true,
    data: filteredRecords,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredRecords.length / parseInt(limit)),
      totalItems: filteredRecords.length,
      hasNext: parseInt(page) * parseInt(limit) < filteredRecords.length,
      hasPrev: parseInt(page) > 1
    }
  });
});

app.post('/api/v1/admin/borrowing/:id/approve', (req, res) => {
  const recordId = req.params.id;
  console.log('📥 Approve borrowing request:', recordId);

  const record = mockBorrowingRecords.find(r => r.id === recordId);
  if (!record) {
    return res.status(404).json({
      success: false,
      message: 'Borrowing record not found'
    });
  }

  record.status = 'approved';
  record.approvedDate = new Date().toISOString();

  res.json({
    success: true,
    message: 'Borrowing request approved successfully',
    data: record
  });
});

app.post('/api/v1/admin/borrowing/:id/reject', (req, res) => {
  const recordId = req.params.id;
  const { reason } = req.body;
  console.log('📥 Reject borrowing request:', recordId, reason);

  const record = mockBorrowingRecords.find(r => r.id === recordId);
  if (!record) {
    return res.status(404).json({
      success: false,
      message: 'Borrowing record not found'
    });
  }

  record.notes = reason;

  res.json({
    success: true,
    message: 'Borrowing request rejected',
    data: record
  });
});

app.post('/api/v1/admin/borrowing/:id/return', (req, res) => {
  const recordId = req.params.id;
  console.log('📥 Return book request:', recordId);

  const record = mockBorrowingRecords.find(r => r.id === recordId);
  if (!record) {
    return res.status(404).json({
      success: false,
      message: 'Borrowing record not found'
    });
  }

  record.status = 'returned';
  record.returnDate = new Date().toISOString();

  res.json({
    success: true,
    message: 'Book returned successfully',
    data: record
  });
});

// Admin Announcements endpoints
const mockAnnouncements = [
  {
    id: '1',
    title: 'Library Hours Extended',
    content: 'Starting next week, the library will be open until 9 PM on weekdays to better serve our community.',
    type: 'info',
    priority: 'medium',
    status: 'published',
    publishDate: '2024-08-15T00:00:00Z',
    expiryDate: '2024-09-15T23:59:59Z',
    authorId: '2',
    authorName: 'Jane Smith',
    targetAudience: 'all',
    createdAt: '2024-08-15T00:00:00Z',
    updatedAt: '2024-08-15T00:00:00Z'
  },
  {
    id: '2',
    title: 'System Maintenance Notice',
    content: 'The library system will undergo maintenance on Sunday, August 25th from 2 AM to 6 AM. Online services will be temporarily unavailable.',
    type: 'warning',
    priority: 'high',
    status: 'published',
    publishDate: '2024-08-18T00:00:00Z',
    expiryDate: '2024-08-26T00:00:00Z',
    authorId: '2',
    authorName: 'Jane Smith',
    targetAudience: 'all',
    createdAt: '2024-08-18T00:00:00Z',
    updatedAt: '2024-08-18T00:00:00Z'
  }
];

app.get('/api/v1/admin/announcements', (req, res) => {
  console.log('📥 Admin announcements request with query:', req.query);
  const { search, status, type, page = 1, limit = 50 } = req.query;
  let filteredAnnouncements = [...mockAnnouncements];

  // Apply search filter
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredAnnouncements = filteredAnnouncements.filter(announcement =>
      announcement.title.toLowerCase().includes(searchTerm) ||
      announcement.content.toLowerCase().includes(searchTerm)
    );
  }

  // Apply status filter
  if (status && status !== '') {
    filteredAnnouncements = filteredAnnouncements.filter(announcement => announcement.status === status);
  }

  // Apply type filter
  if (type && type !== '') {
    filteredAnnouncements = filteredAnnouncements.filter(announcement => announcement.type === type);
  }

  res.json({
    success: true,
    data: filteredAnnouncements,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredAnnouncements.length / parseInt(limit)),
      totalItems: filteredAnnouncements.length,
      hasNext: parseInt(page) * parseInt(limit) < filteredAnnouncements.length,
      hasPrev: parseInt(page) > 1
    }
  });
});

app.post('/api/v1/admin/announcements', (req, res) => {
  const announcementData = req.body;
  console.log('📥 Add announcement request:', announcementData);

  // Validate required fields
  if (!announcementData.title || !announcementData.content) {
    return res.status(400).json({
      success: false,
      message: 'Title and Content are required fields'
    });
  }

  // Create new announcement
  const newAnnouncement = {
    id: Date.now().toString(),
    title: announcementData.title,
    content: announcementData.content,
    type: announcementData.type || 'info',
    priority: announcementData.priority || 'medium',
    status: announcementData.status || 'draft',
    publishDate: announcementData.publishDate || new Date().toISOString(),
    expiryDate: announcementData.expiryDate || null,
    authorId: '2', // Mock admin user
    authorName: 'Jane Smith',
    targetAudience: announcementData.targetAudience || 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Add to mock announcements array
  mockAnnouncements.push(newAnnouncement);

  res.json({
    success: true,
    message: 'Announcement created successfully',
    data: newAnnouncement
  });
});

app.delete('/api/v1/admin/announcements/:id', (req, res) => {
  const announcementId = req.params.id;
  console.log('📥 Delete announcement request:', announcementId);

  const announcementIndex = mockAnnouncements.findIndex(announcement => announcement.id === announcementId);
  if (announcementIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  mockAnnouncements.splice(announcementIndex, 1);

  res.json({
    success: true,
    message: 'Announcement deleted successfully'
  });
});

app.patch('/api/v1/admin/announcements/:id/status', (req, res) => {
  const announcementId = req.params.id;
  const { status } = req.body;
  console.log('📥 Update announcement status:', announcementId, status);

  const announcement = mockAnnouncements.find(a => a.id === announcementId);
  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  announcement.status = status;
  announcement.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Announcement status updated successfully',
    data: announcement
  });
});

// Admin Events endpoints
const mockEvents = [
  {
    id: '1',
    title: 'Book Reading Session',
    description: 'Join us for a community book reading session featuring local authors and their latest works.',
    type: 'reading',
    status: 'upcoming',
    startDate: '2024-08-25T14:00:00Z',
    endDate: '2024-08-25T16:00:00Z',
    location: 'Main Reading Hall',
    maxAttendees: 50,
    currentAttendees: 23,
    organizerId: '2',
    organizerName: 'Jane Smith',
    registrationRequired: true,
    registrationDeadline: '2024-08-24T23:59:59Z',
    tags: ['reading', 'community', 'authors'],
    createdAt: '2024-08-10T00:00:00Z',
    updatedAt: '2024-08-10T00:00:00Z'
  },
  {
    id: '2',
    title: 'Digital Literacy Workshop',
    description: 'Learn essential digital skills including internet browsing, email, and online research techniques.',
    type: 'workshop',
    status: 'ongoing',
    startDate: '2024-08-18T10:00:00Z',
    endDate: '2024-08-18T12:00:00Z',
    location: 'Computer Lab',
    maxAttendees: 20,
    currentAttendees: 18,
    organizerId: '2',
    organizerName: 'Jane Smith',
    registrationRequired: true,
    registrationDeadline: '2024-08-17T23:59:59Z',
    tags: ['workshop', 'digital', 'skills'],
    createdAt: '2024-08-05T00:00:00Z',
    updatedAt: '2024-08-05T00:00:00Z'
  }
];

app.get('/api/v1/admin/events', (req, res) => {
  console.log('📥 Admin events request with query:', req.query);
  const { search, status, type, page = 1, limit = 50 } = req.query;
  let filteredEvents = [...mockEvents];

  // Apply search filter
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredEvents = filteredEvents.filter(event =>
      event.title.toLowerCase().includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm) ||
      event.location.toLowerCase().includes(searchTerm)
    );
  }

  // Apply status filter
  if (status && status !== '') {
    filteredEvents = filteredEvents.filter(event => event.status === status);
  }

  // Apply type filter
  if (type && type !== '') {
    filteredEvents = filteredEvents.filter(event => event.type === type);
  }

  res.json({
    success: true,
    data: filteredEvents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredEvents.length / parseInt(limit)),
      totalItems: filteredEvents.length,
      hasNext: parseInt(page) * parseInt(limit) < filteredEvents.length,
      hasPrev: parseInt(page) > 1
    }
  });
});

app.post('/api/v1/admin/events', (req, res) => {
  const eventData = req.body;
  console.log('📥 Add event request:', eventData);

  // Validate required fields
  if (!eventData.title || !eventData.description || !eventData.startDate || !eventData.endDate) {
    return res.status(400).json({
      success: false,
      message: 'Title, Description, Start Date, and End Date are required fields'
    });
  }

  // Create new event
  const newEvent = {
    id: Date.now().toString(),
    title: eventData.title,
    description: eventData.description,
    type: eventData.type || 'other',
    status: eventData.status || 'upcoming',
    startDate: eventData.startDate,
    endDate: eventData.endDate,
    location: eventData.location || 'TBD',
    maxAttendees: parseInt(eventData.maxAttendees) || null,
    currentAttendees: 0,
    organizerId: '2', // Mock admin user
    organizerName: 'Jane Smith',
    registrationRequired: eventData.registrationRequired || false,
    registrationDeadline: eventData.registrationDeadline || null,
    tags: eventData.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Add to mock events array
  mockEvents.push(newEvent);

  res.json({
    success: true,
    message: 'Event created successfully',
    data: newEvent
  });
});

app.delete('/api/v1/admin/events/:id', (req, res) => {
  const eventId = req.params.id;
  console.log('📥 Delete event request:', eventId);

  const eventIndex = mockEvents.findIndex(event => event.id === eventId);
  if (eventIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  mockEvents.splice(eventIndex, 1);

  res.json({
    success: true,
    message: 'Event deleted successfully'
  });
});

// Admin Settings endpoints
const mockSettings = {
  library: {
    name: 'Yeka Sub City Library',
    address: 'Yeka Sub City, Addis Ababa, Ethiopia',
    phone: '+251 11 123 4567',
    email: 'info@yekalibrary.gov.et',
    website: 'https://yekalibrary.gov.et',
    openingHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: false }
    }
  },
  borrowing: {
    maxBooksPerUser: 5,
    defaultBorrowPeriodDays: 14,
    maxRenewals: 2,
    finePerDay: 2.0,
    reservationPeriodDays: 7,
    overdueNoticeDays: 3
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    overdueReminders: true,
    reservationAlerts: true,
    eventNotifications: true,
    maintenanceAlerts: true
  },
  system: {
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    backupFrequencyHours: 24
  }
};

app.get('/api/v1/admin/settings', (req, res) => {
  console.log('📥 Admin settings request');

  res.json({
    success: true,
    data: mockSettings
  });
});

app.put('/api/v1/admin/settings', (req, res) => {
  const settingsData = req.body;
  console.log('📥 Update settings request:', settingsData);

  // Update mock settings
  if (settingsData.library) {
    Object.assign(mockSettings.library, settingsData.library);
  }
  if (settingsData.borrowing) {
    Object.assign(mockSettings.borrowing, settingsData.borrowing);
  }
  if (settingsData.notifications) {
    Object.assign(mockSettings.notifications, settingsData.notifications);
  }
  if (settingsData.system) {
    Object.assign(mockSettings.system, settingsData.system);
  }

  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: mockSettings
  });
});

app.post('/api/v1/admin/books', (req, res) => {
  const bookData = req.body;
  console.log('📥 Add book request:', bookData);
  console.log('📥 Request headers:', req.headers);
  console.log('📥 Content-Type:', req.headers['content-type']);

  // Check if body is empty
  if (!bookData || Object.keys(bookData).length === 0) {
    console.log('❌ Empty request body');
    return res.status(400).json({
      success: false,
      message: 'Request body is empty or invalid'
    });
  }

  // Validate required fields
  console.log('📥 Validating required fields:', {
    title: bookData.title,
    author: bookData.author,
    category: bookData.category
  });

  if (!bookData.title || !bookData.author || !bookData.category) {
    console.log('❌ Missing required fields');
    return res.status(400).json({
      success: false,
      message: 'Title, Author, and Category are required fields'
    });
  }

  // Create new book with proper structure
  const newBook = {
    id: Date.now().toString(),
    title: bookData.title,
    author: bookData.author,
    isbn: bookData.isbn || '',
    category: bookData.category,
    description: bookData.description || '',
    publisher: bookData.publisher || '',
    publicationDate: bookData.publicationDate || bookData.publishedDate || '',
    pages: parseInt(bookData.pages) || parseInt(bookData.pageCount) || 0,
    language: bookData.language || 'English',
    location: bookData.location || bookData.shelfNumber || '',
    status: bookData.status || 'available',
    availability: {
      totalCopies: parseInt(bookData.totalCopies) || 1,
      availableCopies: parseInt(bookData.totalCopies) || 1,
      borrowedCopies: 0
    },
    rating: 0,
    coverImage: bookData.coverImage || null,
    tags: bookData.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Add to mock books array
  mockBooks.push(newBook);

  res.json({
    success: true,
    message: 'Book added successfully',
    data: newBook
  });
});

app.put('/api/v1/admin/books/:id', (req, res) => {
  const { id } = req.params;
  const bookData = req.body;
  console.log('📥 Update book request:', id, bookData);

  res.json({
    success: true,
    message: 'Book updated successfully',
    data: {
      id,
      ...bookData,
      updatedAt: new Date().toISOString()
    }
  });
});

app.delete('/api/v1/admin/books/:id', (req, res) => {
  const { id } = req.params;
  console.log('📥 Delete book request:', id);

  res.json({
    success: true,
    message: 'Book deleted successfully'
  });
});

// Users management endpoints
app.get('/api/v1/admin/users', (req, res) => {
  console.log('📥 Admin users request');
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+251911234567',
        role: 'user',
        status: 'active',
        membershipType: 'premium',
        joinDate: '2024-01-15',
        lastActive: '2024-08-19',
        borrowedBooks: 2,
        overdueBooks: 0,
        totalBorrows: 15,
        pendingBookings: 0,
        clearanceStatus: 'clear'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+251922345678',
        role: 'user',
        status: 'active',
        membershipType: 'basic',
        joinDate: '2024-01-10',
        lastActive: '2024-08-18',
        borrowedBooks: 1,
        overdueBooks: 1,
        totalBorrows: 8,
        pendingBookings: 1,
        clearanceStatus: 'blocked'
      },
      {
        id: '3',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+251933456789',
        role: 'user',
        status: 'active',
        membershipType: 'student',
        joinDate: '2024-02-01',
        lastActive: '2024-08-19',
        borrowedBooks: 3,
        overdueBooks: 1,
        totalBorrows: 12,
        pendingBookings: 1,
        clearanceStatus: 'blocked'
      },
      {
        id: '4',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        phone: '+251944567890',
        role: 'user',
        status: 'suspended',
        membershipType: 'basic',
        joinDate: '2023-12-15',
        lastActive: '2024-08-10',
        borrowedBooks: 1,
        overdueBooks: 1,
        totalBorrows: 5,
        pendingBookings: 0,
        clearanceStatus: 'blocked'
      },
      {
        id: '5',
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '+251955678901',
        role: 'admin',
        status: 'active',
        membershipType: 'premium',
        joinDate: '2023-01-01',
        lastActive: '2024-08-19',
        borrowedBooks: 0,
        overdueBooks: 0,
        totalBorrows: 25,
        pendingBookings: 0,
        clearanceStatus: 'clear'
      }
    ]
  });
});

app.post('/api/v1/admin/users', (req, res) => {
  const userData = req.body;
  console.log('📥 Add user request:', userData);

  res.json({
    success: true,
    message: 'User added successfully',
    data: {
      id: Date.now().toString(),
      ...userData,
      joinDate: new Date().toISOString()
    }
  });
});

app.put('/api/v1/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const userData = req.body;
  console.log('📥 Update user request:', id, userData);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      id,
      ...userData,
      updatedAt: new Date().toISOString()
    }
  });
});

// Borrowing and Return management
app.get('/api/v1/admin/borrowing', (req, res) => {
  console.log('📥 Admin borrowing management request');
  res.json({
    success: true,
    data: [
      // John Doe's borrowings
      {
        id: 'borrow_1',
        userId: '1',
        bookId: '1',
        bookTitle: 'The Great Gatsby',
        bookAuthor: 'F. Scott Fitzgerald',
        borrowDate: '2024-08-01',
        dueDate: '2024-08-29',
        returnDate: null,
        status: 'active',
        renewalCount: 0,
        maxRenewals: 2,
        requestDate: '2024-07-30'
      },
      {
        id: 'borrow_2',
        userId: '1',
        bookId: '2',
        bookTitle: 'To Kill a Mockingbird',
        bookAuthor: 'Harper Lee',
        borrowDate: '2024-08-05',
        dueDate: '2024-09-05',
        returnDate: null,
        status: 'active',
        renewalCount: 1,
        maxRenewals: 2,
        requestDate: '2024-08-03'
      },
      // Jane Smith's borrowings (with overdue)
      {
        id: 'borrow_3',
        userId: '2',
        bookId: '3',
        bookTitle: '1984',
        bookAuthor: 'George Orwell',
        borrowDate: '2024-07-20',
        dueDate: '2024-08-17', // This will be overdue by 2 days
        returnDate: null,
        status: 'active', // This will be overdue
        renewalCount: 0,
        maxRenewals: 2,
        requestDate: '2024-07-18'
      },
      // Alice Johnson's borrowings
      {
        id: 'borrow_4',
        userId: '3',
        bookId: '4',
        bookTitle: 'Pride and Prejudice',
        bookAuthor: 'Jane Austen',
        borrowDate: '2024-08-10',
        dueDate: '2024-09-10',
        returnDate: null,
        status: 'active',
        renewalCount: 0,
        maxRenewals: 2,
        requestDate: '2024-08-08'
      },
      {
        id: 'borrow_5',
        userId: '3',
        bookId: '5',
        bookTitle: 'The Catcher in the Rye',
        bookAuthor: 'J.D. Salinger',
        borrowDate: '2024-08-12',
        dueDate: '2024-09-12',
        returnDate: null,
        status: 'active',
        renewalCount: 0,
        maxRenewals: 2,
        requestDate: '2024-08-10'
      },
      {
        id: 'borrow_6',
        userId: '3',
        bookId: '6',
        bookTitle: 'Lord of the Flies',
        bookAuthor: 'William Golding',
        borrowDate: '2024-07-25',
        dueDate: '2024-08-15', // This will be overdue by 4 days
        returnDate: null,
        status: 'active', // This will be overdue
        renewalCount: 1,
        maxRenewals: 2,
        requestDate: '2024-07-23'
      },
      // Bob Wilson's borrowings (overdue)
      {
        id: 'borrow_7',
        userId: '4',
        bookId: '7',
        bookTitle: 'Brave New World',
        bookAuthor: 'Aldous Huxley',
        borrowDate: '2024-07-15',
        dueDate: '2024-08-12', // This will be overdue by 7 days
        returnDate: null,
        status: 'active', // This will be overdue
        renewalCount: 2,
        maxRenewals: 2,
        requestDate: '2024-07-13'
      },
      // Pending requests
      {
        id: 'request_1',
        userId: '2',
        bookId: '8',
        bookTitle: 'The Hobbit',
        bookAuthor: 'J.R.R. Tolkien',
        borrowDate: null,
        dueDate: null,
        returnDate: null,
        status: 'pending',
        renewalCount: 0,
        maxRenewals: 2,
        requestDate: '2024-08-18',
        priority: 1
      },
      {
        id: 'request_2',
        userId: '3',
        bookId: '9',
        bookTitle: 'Harry Potter and the Philosopher\'s Stone',
        bookAuthor: 'J.K. Rowling',
        borrowDate: null,
        dueDate: null,
        returnDate: null,
        status: 'pending',
        renewalCount: 0,
        maxRenewals: 2,
        requestDate: '2024-08-17',
        priority: 2
      }
    ]
  });
});

app.post('/api/v1/admin/borrowing/issue', (req, res) => {
  const { userId, bookId, dueDate } = req.body;
  console.log('📥 Issue book request:', { userId, bookId, dueDate });

  res.json({
    success: true,
    message: 'Book issued successfully',
    data: {
      id: Date.now().toString(),
      userId,
      bookId,
      borrowDate: new Date().toISOString(),
      dueDate,
      status: 'active'
    }
  });
});

app.post('/api/v1/admin/borrowing/return/:id', (req, res) => {
  const { id } = req.params;
  console.log('📥 Return book request:', id);

  res.json({
    success: true,
    message: 'Book returned successfully',
    data: {
      id,
      returnDate: new Date().toISOString(),
      status: 'returned'
    }
  });
});

// Announcements management
app.get('/api/v1/admin/announcements', (req, res) => {
  console.log('📥 Admin announcements request');
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Library Hours Extended',
        content: 'Starting next week, the library will be open until 9 PM on weekdays.',
        type: 'info',
        priority: 'medium',
        status: 'active',
        createdAt: '2024-02-01T10:00:00Z',
        expiresAt: '2024-03-01T23:59:59Z'
      },
      {
        id: '2',
        title: 'New Book Collection Available',
        content: 'We have added 50 new books to our Ethiopian Literature section.',
        type: 'news',
        priority: 'high',
        status: 'active',
        createdAt: '2024-01-28T14:30:00Z',
        expiresAt: '2024-02-28T23:59:59Z'
      }
    ]
  });
});

app.post('/api/v1/admin/announcements', (req, res) => {
  const announcementData = req.body;
  console.log('📥 Add announcement request:', announcementData);

  res.json({
    success: true,
    message: 'Announcement created successfully',
    data: {
      id: Date.now().toString(),
      ...announcementData,
      createdAt: new Date().toISOString()
    }
  });
});

// Events management
app.get('/api/v1/admin/events', (req, res) => {
  console.log('📥 Admin events request');
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Book Reading Session',
        description: 'Join us for a community book reading session featuring local authors.',
        date: '2024-02-25T15:00:00Z',
        location: 'Main Hall',
        capacity: 50,
        registered: 23,
        status: 'upcoming',
        createdAt: '2024-02-01T10:00:00Z'
      },
      {
        id: '2',
        title: 'Digital Literacy Workshop',
        description: 'Learn basic computer skills and internet usage.',
        date: '2024-03-05T10:00:00Z',
        location: 'Computer Lab',
        capacity: 20,
        registered: 15,
        status: 'upcoming',
        createdAt: '2024-01-25T09:00:00Z'
      }
    ]
  });
});

app.post('/api/v1/admin/events', (req, res) => {
  const eventData = req.body;
  console.log('📥 Add event request:', eventData);

  res.json({
    success: true,
    message: 'Event created successfully',
    data: {
      id: Date.now().toString(),
      ...eventData,
      registered: 0,
      createdAt: new Date().toISOString()
    }
  });
});

// System settings
app.get('/api/v1/admin/settings', (req, res) => {
  console.log('📥 Admin settings request');
  res.json({
    success: true,
    data: {
      library: {
        name: 'Yeka Sub City Library',
        address: 'Addis Ababa, Ethiopia',
        phone: '+251-11-123-4567',
        email: 'info@yekalibrary.gov.et',
        workingHours: {
          weekdays: '8:00 AM - 6:00 PM',
          weekends: '9:00 AM - 4:00 PM'
        }
      },
      borrowing: {
        maxBooksPerUser: 3,
        loanPeriodDays: 14,
        maxRenewals: 2,
        overdueFineDailyRate: 2.00
      },
      notifications: {
        reminderDaysBefore: 3,
        overdueNotificationEnabled: true,
        emailNotificationsEnabled: true,
        smsNotificationsEnabled: false
      }
    }
  });
});

app.put('/api/v1/admin/settings', (req, res) => {
  const settingsData = req.body;
  console.log('📥 Update settings request:', settingsData);

  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: {
      ...settingsData,
      updatedAt: new Date().toISOString()
    }
  });
});

// Interactive actions
app.post('/api/v1/dashboard/send-reminder/:bookId', (req, res) => {
  const { bookId } = req.params;
  console.log('📥 Send reminder request for book:', bookId);

  res.json({
    success: true,
    message: 'Reminder sent successfully',
    data: {
      bookId,
      reminderSent: true,
      timestamp: new Date().toISOString()
    }
  });
});

app.post('/api/v1/dashboard/renew-book/:bookId', (req, res) => {
  const { bookId } = req.params;
  console.log('📥 Renew book request for book:', bookId);

  res.json({
    success: true,
    message: 'Book renewed successfully',
    data: {
      bookId,
      newDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      renewalCount: 1,
      timestamp: new Date().toISOString()
    }
  });
});

app.post('/api/v1/dashboard/return-book/:bookId', (req, res) => {
  const { bookId } = req.params;
  console.log('📥 Return book request for book:', bookId);

  res.json({
    success: true,
    message: 'Book returned successfully',
    data: {
      bookId,
      status: 'returned',
      returnDate: new Date().toISOString(),
      status: 'returned'
    }
  });
});

app.post('/api/v1/dashboard/mark-returned/:bookId', (req, res) => {
  const { bookId } = req.params;
  console.log('📥 Mark returned request for book:', bookId);

  res.json({
    success: true,
    message: 'Book marked as returned successfully',
    data: {
      bookId,
      returnDate: new Date().toISOString()
    }
  });
});

app.post('/api/v1/dashboard/notify-user/:reservationId', (req, res) => {
  const { reservationId } = req.params;
  console.log('📥 Notify user request for reservation:', reservationId);

  res.json({
    success: true,
    message: 'User notified successfully',
    data: {
      reservationId,
      notificationSent: true,
      timestamp: new Date().toISOString()
    }
  });
});

app.post('/api/v1/dashboard/cancel-reservation/:reservationId', (req, res) => {
  const { reservationId } = req.params;
  console.log('📥 Cancel reservation request:', reservationId);

  res.json({
    success: true,
    message: 'Reservation cancelled successfully',
    data: {
      reservationId,
      status: 'cancelled',
      timestamp: new Date().toISOString()
    }
  });
});

app.put('/api/v1/dashboard/profile', (req, res) => {
  const { name, email, notifications } = req.body;
  console.log('📥 Profile update request:', { name, email, notifications });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: '1',
      name: name || 'System Administrator',
      email: email || 'admin@yekalibrary.gov.et',
      role: 'admin',
      status: 'active',
      notifications: notifications || {
        emailNotifications: true,
        overdueAlerts: true,
        weeklyReports: true
      },
      updatedAt: new Date().toISOString()
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ Route not found:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Yeka Library Backend Server Started!`);
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📚 API available at: http://localhost:${PORT}/api/v1`);
  console.log(`\n📱 Demo Accounts:`);
  console.log(`   Admin: admin@yekalibrary.gov.et / admin123`);
  console.log(`   User:  user@example.com / user123`);
  console.log(`\n🔧 CORS enabled for all origins`);
  console.log(`✅ Server ready to accept connections!`);
  console.log(`\n🔇 Deprecation warnings suppressed for cleaner output`);
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
