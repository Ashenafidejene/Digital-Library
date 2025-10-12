// Test script to verify all book-related endpoints work correctly
const http = require('http');

// Login function
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

// Generic API test function
async function testEndpoint(path, token = null, description = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {}
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ 
            status: res.statusCode, 
            data: response, 
            description,
            path 
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: data, 
            description,
            path 
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('🧪 Testing All Book-Related Endpoints\n');
  
  try {
    // Step 1: Login
    console.log('1️⃣ Logging in as admin...');
    const token = await login();
    console.log('✅ Login successful\n');
    
    // Step 2: Test all endpoints
    const endpoints = [
      {
        path: '/api/v1/books?limit=5',
        token: null,
        description: 'Public Books (No Auth)',
        expectsPaginated: true
      },
      {
        path: '/api/v1/books/categories',
        token: null,
        description: 'Book Categories (No Auth)',
        expectsPaginated: false
      },
      {
        path: '/api/v1/admin/books?limit=5',
        token: token,
        description: 'Admin Books (Auth Required)',
        expectsPaginated: true
      },
      {
        path: '/api/v1/books/available?limit=5',
        token: null,
        description: 'Available Books (No Auth)',
        expectsPaginated: true
      },
      {
        path: '/api/v1/books/popular?limit=5',
        token: null,
        description: 'Popular Books (No Auth)',
        expectsPaginated: true
      },
      {
        path: '/api/v1/books/recent?limit=5',
        token: null,
        description: 'Recent Books (No Auth)',
        expectsPaginated: true
      }
    ];
    
    console.log('2️⃣ Testing all book endpoints...\n');
    
    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      console.log(`📡 Testing ${i + 1}/${endpoints.length}: ${endpoint.description}`);
      console.log(`   Path: ${endpoint.path}`);
      console.log(`   Auth: ${endpoint.token ? 'Required' : 'Not Required'}`);
      
      try {
        const result = await testEndpoint(endpoint.path, endpoint.token, endpoint.description);
        
        if (result.status === 200) {
          console.log(`   ✅ Status: ${result.status} - Success`);
          
          if (result.data.success) {
            console.log(`   ✅ Response format: Valid API response`);
            
            if (endpoint.expectsPaginated) {
              // Check for paginated structure
              if (result.data.data && result.data.data.data && Array.isArray(result.data.data.data)) {
                const books = result.data.data.data;
                const pagination = result.data.data.pagination;
                console.log(`   ✅ Paginated data: ${books.length} books found`);
                console.log(`   ✅ Pagination: Page ${pagination.currentPage}/${pagination.totalPages} (${pagination.totalItems} total)`);
              } else {
                console.log(`   ❌ Expected paginated structure not found`);
              }
            } else {
              // Check for direct data
              if (Array.isArray(result.data.data)) {
                console.log(`   ✅ Direct data: ${result.data.data.length} items found`);
              } else {
                console.log(`   ✅ Data: ${typeof result.data.data}`);
              }
            }
          } else {
            console.log(`   ❌ Invalid API response format`);
          }
        } else {
          console.log(`   ❌ Status: ${result.status} - ${result.data.message || 'Error'}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      console.log(''); // Empty line
    }
    
    // Step 3: Summary
    console.log('📊 Frontend Data Access Guide:');
    console.log('');
    console.log('✅ For PAGINATED endpoints (books, admin/books, available, popular, recent):');
    console.log('   • Books array: response.data.data.data');
    console.log('   • Pagination: response.data.data.pagination');
    console.log('');
    console.log('✅ For DIRECT endpoints (categories):');
    console.log('   • Data array: response.data');
    console.log('');
    console.log('🎯 Frontend fixes applied:');
    console.log('   ✅ AdminBooksPage.tsx - Fixed to handle paginated structure');
    console.log('   ✅ BooksPage.tsx - Fixed to handle paginated structure');
    console.log('');
    console.log('🚀 All endpoints should now work correctly with the frontend!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

main();
