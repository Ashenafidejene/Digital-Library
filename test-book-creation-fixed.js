// Test script to verify the fixed book creation functionality
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

// Test book creation
async function createBook(token, bookData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(bookData);
    
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

async function testBookCreation() {
  console.log('🧪 Testing Fixed Book Creation Functionality\n');
  
  try {
    // Step 1: Login
    console.log('1️⃣ Logging in as admin...');
    const token = await login();
    console.log('✅ Login successful\n');
    
    // Step 2: Test with correct data structure
    console.log('2️⃣ Testing book creation with correct data structure...');
    
    const testBooks = [
      {
        title: "Test Book 1",
        author: "Test Author 1",
        description: "This is a comprehensive test book to verify the API functionality works correctly.",
        category: "Fiction",
        isbn: "9781234567890", // Valid 13-digit ISBN
        availability: {
          totalCopies: 3,
          availableCopies: 3
        },
        location: {
          shelf: "TEST-001",
          section: "Test Section"
        },
        language: "English"
      },
      {
        title: "Test Book 2",
        author: "Test Author 2", 
        description: "Another test book without ISBN to verify optional field handling.",
        category: "Science",
        // No ISBN - should be optional
        availability: {
          totalCopies: 2,
          availableCopies: 2
        },
        location: {
          shelf: "TEST-002",
          section: "Science Section"
        },
        language: "English"
      },
      {
        title: "Test Book 3",
        author: "Test Author 3",
        description: "Testing with 10-digit ISBN format to ensure both formats work correctly.",
        category: "Technology",
        isbn: "0123456789", // Valid 10-digit ISBN
        availability: {
          totalCopies: 1,
          availableCopies: 1
        },
        location: {
          shelf: "TEST-003",
          section: "Technology Section"
        },
        language: "English"
      }
    ];
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < testBooks.length; i++) {
      const book = testBooks[i];
      console.log(`📖 Testing book ${i + 1}: "${book.title}"`);
      console.log(`   ISBN: ${book.isbn || 'Not provided'}`);
      console.log(`   Total Copies: ${book.availability.totalCopies}`);
      console.log(`   Shelf: ${book.location.shelf}`);
      console.log(`   Section: ${book.location.section}`);
      
      try {
        const result = await createBook(token, book);
        
        if (result.status === 200 || result.status === 201) {
          console.log(`   ✅ SUCCESS: Book created successfully`);
          if (result.data.data && result.data.data.id) {
            console.log(`   📝 Book ID: ${result.data.data.id}`);
          }
          successCount++;
        } else {
          console.log(`   ❌ FAILED: Status ${result.status}`);
          console.log(`   📋 Error: ${result.data.message || JSON.stringify(result.data)}`);
          failCount++;
        }
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        failCount++;
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Step 3: Summary
    console.log('📊 Test Results Summary:');
    console.log(`✅ Successful: ${successCount}/${testBooks.length}`);
    console.log(`❌ Failed: ${failCount}/${testBooks.length}`);
    
    if (successCount === testBooks.length) {
      console.log('\n🎉 ALL TESTS PASSED! Book creation is working correctly.');
      console.log('\n💡 You can now use the frontend form to add books with confidence!');
      console.log('\n📋 Frontend Form Requirements:');
      console.log('   • Title: Required (1-200 characters)');
      console.log('   • Author: Required (1-100 characters)');
      console.log('   • Description: Required (10-2000 characters)');
      console.log('   • Category: Required (select from dropdown)');
      console.log('   • ISBN: Optional (10 or 13 digits)');
      console.log('   • Shelf Number: Required');
      console.log('   • Section: Required');
      console.log('   • Total Copies: Required (minimum 1)');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the error messages above.');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testBookCreation();
