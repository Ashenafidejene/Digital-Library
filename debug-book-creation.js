// Debug script to see what data the backend receives
const http = require('http');

// Login first to get token
async function login() {
  return new Promise((resolve, reject) => {
    const loginData = JSON.stringify({
      email: "testadmin@library.com",
      password: "TestAdmin123!"
    });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.data && response.data.tokens) {
            resolve(response.data.tokens.accessToken);
          } else {
            reject(new Error('No token in response'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(loginData);
    req.end();
  });
}

// Test book creation with minimal data
async function testBookCreation(token) {
  const testBook = {
    title: "Debug Test Book",
    author: "Test Author",
    description: "This is a test book for debugging the API endpoint and data structure.",
    category: "Fiction",
    code: "DEBUG-001",
    availability: {
      totalCopies: 1,
      availableCopies: 1
    },
    location: {
      shelf: "DEBUG-SHELF",
      section: "Test Section"
    }
  };

  console.log('📤 Sending book data:', JSON.stringify(testBook, null, 2));

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testBook);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/admin/books',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function debug() {
  console.log('🔍 Debugging book creation...\n');
  
  try {
    console.log('1️⃣ Getting authentication token...');
    const token = await login();
    console.log('✅ Token obtained:', token.substring(0, 20) + '...\n');
    
    console.log('2️⃣ Testing book creation...');
    const result = await testBookCreation(token);
    
    console.log(`📥 Response Status: ${result.status}`);
    console.log('📥 Response Data:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 200 || result.status === 201) {
      console.log('\n✅ Book creation successful!');
    } else {
      console.log('\n❌ Book creation failed');
      if (result.data.message) {
        console.log('Error message:', result.data.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Debug failed:', error.message);
  }
}

debug();
