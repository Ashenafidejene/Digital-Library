// Test which backend is running
const http = require('http');

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testBackend() {
  console.log('🧪 Testing backend endpoints...\n');
  
  // Test 1: Check if server is running
  try {
    console.log('1️⃣ Testing server connection...');
    const result = await testEndpoint('/api/v1/admin/books');
    console.log(`✅ Server is running! Status: ${result.status}`);
    
    if (result.status === 401) {
      console.log('🔒 TypeScript backend detected (requires authentication)');
    } else if (result.status === 200) {
      console.log('🚀 Simple backend detected (no authentication required)');
      console.log(`📚 Current books count: ${result.data.data ? result.data.data.length : 0}`);
    }
  } catch (error) {
    console.log('❌ Server not running or connection failed:', error.message);
    return;
  }
  
  console.log('\n2️⃣ Testing book creation...');
  
  // Test 2: Try to add a book
  const testBook = {
    title: "Test Book",
    author: "Test Author", 
    description: "This is a test book to verify the API is working correctly.",
    category: "Fiction",
    isbn: "9781234567890",
    publisher: "Test Publisher",
    publishedDate: "2024-01-01",
    pageCount: 200,
    language: "English",
    availability: {
      totalCopies: 1,
      availableCopies: 1
    },
    location: {
      shelf: "TEST-001",
      section: "Test",
      floor: "Ground Floor"
    }
  };
  
  try {
    const addResult = await testEndpoint('/api/v1/admin/books', 'POST', testBook);
    console.log(`📤 Add book result: Status ${addResult.status}`);
    
    if (addResult.status === 200 || addResult.status === 201) {
      console.log('✅ Book added successfully!');
      console.log(`📖 Book ID: ${addResult.data.data ? addResult.data.data.id : 'N/A'}`);
    } else {
      console.log('❌ Failed to add book:');
      console.log(`   Error: ${addResult.data.message || JSON.stringify(addResult.data)}`);
    }
  } catch (error) {
    console.log('❌ Error adding book:', error.message);
  }
  
  console.log('\n3️⃣ Testing book retrieval...');
  
  // Test 3: Get books again to see if it was added
  try {
    const getResult = await testEndpoint('/api/v1/admin/books');
    if (getResult.status === 200) {
      const books = getResult.data.data || [];
      console.log(`✅ Retrieved ${books.length} books from database`);
      
      if (books.length > 0) {
        console.log('\n📚 Sample books:');
        books.slice(0, 3).forEach((book, index) => {
          console.log(`   ${index + 1}. "${book.title}" by ${book.author}`);
        });
      }
    } else {
      console.log('❌ Failed to retrieve books');
    }
  } catch (error) {
    console.log('❌ Error retrieving books:', error.message);
  }
  
  console.log('\n🏁 Backend test completed!');
}

testBackend().catch(console.error);
