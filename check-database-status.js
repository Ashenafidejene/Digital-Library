// Script to check database status and clear if needed
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

// Get all books
async function getAllBooks(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/admin/books',
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

// Delete a book
async function deleteBook(token, bookId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/v1/admin/books/${bookId}`,
      method: 'DELETE',
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

// Test book creation with code field
async function createBookWithCode(token, bookData) {
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

async function main() {
  console.log('🔍 Checking Database Status and Testing Solutions\n');
  
  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const token = await login();
    console.log('✅ Login successful\n');
    
    // Step 2: Check existing books
    console.log('2️⃣ Checking existing books...');
    const booksResult = await getAllBooks(token);
    
    if (booksResult.status === 200 && booksResult.data.data) {
      const books = booksResult.data.data;
      console.log(`📚 Found ${books.length} existing books in database`);
      
      if (books.length > 0) {
        console.log('\n📋 Existing books:');
        books.forEach((book, index) => {
          console.log(`   ${index + 1}. "${book.title}" by ${book.author}`);
          console.log(`      ID: ${book.id || book._id}`);
          console.log(`      Code: ${book.code || 'undefined'}`);
          console.log(`      ISBN: ${book.isbn || 'undefined'}`);
          console.log('');
        });
        
        // Step 3: Clear existing books
        console.log('3️⃣ Clearing existing books to resolve code constraint...');
        let deletedCount = 0;
        for (const book of books) {
          try {
            const deleteResult = await deleteBook(token, book.id || book._id);
            if (deleteResult.status === 200) {
              console.log(`   ✅ Deleted: "${book.title}"`);
              deletedCount++;
            } else {
              console.log(`   ❌ Failed to delete: "${book.title}"`);
            }
          } catch (error) {
            console.log(`   ❌ Error deleting "${book.title}": ${error.message}`);
          }
        }
        console.log(`\n📊 Deleted ${deletedCount}/${books.length} books\n`);
      }
    } else {
      console.log('📚 No existing books found or error accessing database\n');
    }
    
    // Step 4: Test book creation with code field
    console.log('4️⃣ Testing book creation with code field...');
    const testBook = {
      title: "Working Test Book",
      author: "Test Author",
      description: "This is a test book to verify the API works after clearing the database.",
      category: "Fiction",
      code: "WORK-001", // Add code field
      isbn: "9781234567890",
      availability: {
        totalCopies: 1,
        availableCopies: 1
      },
      location: {
        shelf: "WORK-001",
        section: "Test Section"
      },
      language: "English"
    };
    
    console.log('📤 Attempting to create book with code field...');
    const createResult = await createBookWithCode(token, testBook);
    
    if (createResult.status === 200 || createResult.status === 201) {
      console.log('✅ SUCCESS! Book created successfully with code field');
      console.log(`📝 Book ID: ${createResult.data.data?.id || 'N/A'}`);
    } else {
      console.log(`❌ FAILED: Status ${createResult.status}`);
      console.log(`📋 Error: ${createResult.data.message || JSON.stringify(createResult.data)}`);
      
      // Step 5: Try without code field
      console.log('\n5️⃣ Trying without code field...');
      const testBookNoCode = { ...testBook };
      delete testBookNoCode.code;
      
      const createResult2 = await createBookWithCode(token, testBookNoCode);
      if (createResult2.status === 200 || createResult2.status === 201) {
        console.log('✅ SUCCESS! Book created successfully without code field');
        console.log(`📝 Book ID: ${createResult2.data.data?.id || 'N/A'}`);
      } else {
        console.log(`❌ FAILED: Status ${createResult2.status}`);
        console.log(`📋 Error: ${createResult2.data.message || JSON.stringify(createResult2.data)}`);
      }
    }
    
    // Step 6: Final verification
    console.log('\n6️⃣ Final verification...');
    const finalResult = await getAllBooks(token);
    if (finalResult.status === 200 && finalResult.data.data) {
      const finalBooks = finalResult.data.data;
      console.log(`✅ Database now contains ${finalBooks.length} books`);
      if (finalBooks.length > 0) {
        console.log('\n📚 Current books:');
        finalBooks.forEach((book, index) => {
          console.log(`   ${index + 1}. "${book.title}" by ${book.author}`);
        });
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

main();
