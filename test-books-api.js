// Test script to verify the books API response structure
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

// Test books API
async function testBooksAPI(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/admin/books?limit=50',
      method: 'GET',
      headers: {
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
    req.end();
  });
}

async function main() {
  console.log('🧪 Testing Books API Response Structure\n');
  
  try {
    // Step 1: Login
    console.log('1️⃣ Logging in as admin...');
    const token = await login();
    console.log('✅ Login successful\n');
    
    // Step 2: Test books API
    console.log('2️⃣ Testing /api/v1/admin/books endpoint...');
    const result = await testBooksAPI(token);
    
    console.log(`📡 Response Status: ${result.status}`);
    console.log('📋 Response Structure:');
    console.log(JSON.stringify(result.data, null, 2));
    
    if (result.status === 200) {
      console.log('\n✅ API Response Analysis:');
      
      if (result.data.success) {
        console.log('   ✅ Response has success: true');
      } else {
        console.log('   ❌ Response missing success field or false');
      }
      
      if (result.data.message) {
        console.log(`   ✅ Response message: "${result.data.message}"`);
      } else {
        console.log('   ❌ Response missing message field');
      }
      
      if (result.data.data) {
        console.log('   ✅ Response has data field');
        
        if (result.data.data.data && Array.isArray(result.data.data.data)) {
          const books = result.data.data.data;
          console.log(`   ✅ Books array found with ${books.length} books`);
          
          if (books.length > 0) {
            console.log('\n📚 Sample Book Structure:');
            const sampleBook = books[0];
            console.log('   Fields available:');
            Object.keys(sampleBook).forEach(key => {
              console.log(`     • ${key}: ${typeof sampleBook[key]}`);
            });
            
            console.log('\n📖 Sample Book Data:');
            console.log(`   Title: ${sampleBook.title}`);
            console.log(`   Author: ${sampleBook.author}`);
            console.log(`   Category: ${sampleBook.category}`);
            console.log(`   Status: ${sampleBook.status}`);
            console.log(`   ISBN: ${sampleBook.isbn || 'N/A'}`);
            console.log(`   Code: ${sampleBook.code || 'N/A'}`);
            if (sampleBook.availability) {
              console.log(`   Copies: ${sampleBook.availability.availableCopies}/${sampleBook.availability.totalCopies}`);
            }
            if (sampleBook.location) {
              console.log(`   Location: ${sampleBook.location.shelf} - ${sampleBook.location.section}`);
            }
          }
        } else {
          console.log('   ❌ Books array not found in response.data.data');
        }
        
        if (result.data.data.pagination) {
          const pagination = result.data.data.pagination;
          console.log('\n📄 Pagination Info:');
          console.log(`   Current Page: ${pagination.currentPage}`);
          console.log(`   Total Pages: ${pagination.totalPages}`);
          console.log(`   Total Items: ${pagination.totalItems}`);
          console.log(`   Items Per Page: ${pagination.itemsPerPage}`);
        } else {
          console.log('   ❌ Pagination info not found');
        }
      } else {
        console.log('   ❌ Response missing data field');
      }
      
      console.log('\n🎯 Frontend Fix Required:');
      console.log('   The frontend should access books via: response.data.data.data');
      console.log('   Current frontend code expects: response.data (direct array)');
      console.log('   ✅ This has been fixed in AdminBooksPage.tsx');
      
    } else {
      console.log(`\n❌ API returned error status: ${result.status}`);
      if (result.data.message) {
        console.log(`   Error: ${result.data.message}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

main();
