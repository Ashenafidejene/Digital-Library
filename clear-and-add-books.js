// Script to clear existing books and add new ones
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

// Add a book
async function addBook(token, bookData) {
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
  console.log('🚀 Starting library setup...\n');
  
  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const token = await login();
    console.log('✅ Login successful\n');
    
    // Step 2: Get existing books
    console.log('2️⃣ Checking existing books...');
    const booksResult = await getAllBooks(token);
    
    if (booksResult.status === 200 && booksResult.data.data) {
      const books = booksResult.data.data;
      console.log(`📚 Found ${books.length} existing books`);
      
      // Step 3: Delete existing books
      if (books.length > 0) {
        console.log('🗑️ Deleting existing books...');
        for (let i = 0; i < books.length; i++) {
          const book = books[i];
          console.log(`   Deleting: "${book.title}"`);
          try {
            await deleteBook(token, book.id || book._id);
          } catch (error) {
            console.log(`   ❌ Failed to delete: ${error.message}`);
          }
        }
        console.log('✅ Existing books cleared\n');
      }
    }
    
    // Step 4: Add new books
    console.log('3️⃣ Adding new books...');
    
    const newBooks = [
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        description: "A gripping tale of racial injustice and childhood innocence in the American South.",
        category: "Fiction",
        code: "LIB-001",
        isbn: "9780061120084",
        publisher: "J.B. Lippincott & Co.",
        publishedDate: "1960-07-11",
        pageCount: 376,
        language: "English",
        availability: { totalCopies: 5, availableCopies: 5 },
        location: { shelf: "A-001", section: "Fiction", floor: "Ground Floor" }
      },
      {
        title: "1984",
        author: "George Orwell",
        description: "A dystopian social science fiction novel exploring totalitarianism and surveillance.",
        category: "Fiction",
        code: "LIB-002",
        isbn: "9780451524935",
        publisher: "Secker & Warburg",
        publishedDate: "1949-06-08",
        pageCount: 328,
        language: "English",
        availability: { totalCopies: 4, availableCopies: 4 },
        location: { shelf: "A-002", section: "Fiction", floor: "Ground Floor" }
      },
      {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        description: "A romantic novel critiquing British landed gentry at the end of the 18th century.",
        category: "Romance",
        code: "LIB-003",
        isbn: "9780141439518",
        publisher: "T. Egerton",
        publishedDate: "1813-01-28",
        pageCount: 432,
        language: "English",
        availability: { totalCopies: 3, availableCopies: 3 },
        location: { shelf: "B-001", section: "Romance", floor: "Ground Floor" }
      }
    ];
    
    let successCount = 0;
    for (let i = 0; i < newBooks.length; i++) {
      const book = newBooks[i];
      console.log(`📖 Adding: "${book.title}"`);
      
      try {
        const result = await addBook(token, book);
        if (result.status === 200 || result.status === 201) {
          console.log(`   ✅ Success`);
          successCount++;
        } else {
          console.log(`   ❌ Failed: ${result.data.message}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Setup complete! Added ${successCount}/${newBooks.length} books`);
    
    // Step 5: Verify
    console.log('\n4️⃣ Verifying books...');
    const finalResult = await getAllBooks(token);
    if (finalResult.status === 200 && finalResult.data.data) {
      const finalBooks = finalResult.data.data;
      console.log(`✅ Database now contains ${finalBooks.length} books:`);
      finalBooks.forEach((book, index) => {
        console.log(`   ${index + 1}. "${book.title}" by ${book.author} (Code: ${book.code || 'N/A'})`);
      });
    }
    
  } catch (error) {
    console.log('❌ Setup failed:', error.message);
  }
}

main();
