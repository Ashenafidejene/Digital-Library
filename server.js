const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 9999;

console.log('🚀 Starting Yeka Library Backend Server on port', PORT);

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json());

// Mock data
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

// Routes
app.get('/', (req, res) => {
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
  
  console.log('Login attempt:', { email });
  
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

app.listen(PORT, () => {
  console.log(`\n🚀 Yeka Sub City Library Backend Server Started!`);
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📚 API available at: http://localhost:${PORT}/api/v1`);
  console.log(`\n📱 Demo Accounts:`);
  console.log(`   Admin: admin@yekalibrary.gov.et / admin123`);
  console.log(`   User:  user@example.com / user123`);
  console.log(`\n🎯 Next Step: Start frontend with "cd frontend && npm start"`);
  console.log(`   Frontend will be available at: http://localhost:3003`);
});
