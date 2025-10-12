// Complete setup script: Create admin user, login, and add books
const http = require('http');

const API_BASE_URL = 'http://localhost:3000';

// Admin user credentials - create new admin
const adminUser = {
  name: "Test Library Admin",
  email: "testadmin@library.com",  // Different email to avoid conflicts
  password: "TestAdmin123!",  // Strong password
  role: "admin"
};

// Function to make HTTP requests
function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) }),
        ...(token && { 'Authorization': `Bearer ${token}` })
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

// Step 1: Register admin user
async function registerAdmin() {
  console.log('👤 Step 1: Registering admin user...');
  
  try {
    const result = await makeRequest('/api/v1/auth/register', 'POST', adminUser);
    
    if (result.status === 200 || result.status === 201) {
      console.log('✅ Admin user registered successfully!');
      return true;
    } else if (result.status === 400 && result.data.message &&
               (result.data.message.includes('already exists') ||
                result.data.message.includes('User with this email already exists'))) {
      console.log('ℹ️ Admin user already exists, proceeding to login...');
      return true;
    } else {
      console.log('❌ Failed to register admin:', result.data.message);
      console.log('ℹ️ Attempting to proceed with existing user...');
      return true; // Try to proceed anyway
    }
  } catch (error) {
    console.log('❌ Error registering admin:', error.message);
    return false;
  }
}

// Step 2: Login and get token
async function loginAdmin() {
  console.log('\n🔐 Step 2: Logging in as admin...');

  try {
    const loginData = {
      email: adminUser.email,
      password: adminUser.password
    };

    const result = await makeRequest('/api/v1/auth/login', 'POST', loginData);

    if (result.status === 200) {
      console.log('✅ Login successful!');
      console.log('📋 Login response:', JSON.stringify(result.data, null, 2));

      const token = result.data.data?.tokens?.accessToken || result.data.data?.accessToken || result.data.accessToken || result.data.token;
      if (token) {
        console.log(`🎫 Token: ${token.substring(0, 20)}...`);
        return token;
      } else {
        console.log('❌ No token found in response');
        return null;
      }
    } else {
      console.log('❌ Login failed:', result.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Error during login:', error.message);
    return null;
  }
}

// Step 3: Add famous books
async function addFamousBooks(token) {
  console.log('\n📚 Step 3: Adding 10 famous books...');
  
  const famousBooks = [
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      description: "A gripping tale of racial injustice and childhood innocence in the American South.",
      category: "Fiction",
      code: "BOOK-001",  // Add unique code
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
      code: "BOOK-002",  // Add unique code
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
      code: "BOOK-003",  // Add unique code
      isbn: "9780141439518",
      publisher: "T. Egerton",
      publishedDate: "1813-01-28",
      pageCount: 432,
      language: "English",
      availability: { totalCopies: 3, availableCopies: 3 },
      location: { shelf: "B-001", section: "Romance", floor: "Ground Floor" }
    },
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      description: "A classic American novel set in the Jazz Age exploring the American Dream.",
      category: "Fiction",
      code: "BOOK-004",  // Add unique code
      isbn: "9780743273565",
      publisher: "Charles Scribner's Sons",
      publishedDate: "1925-04-10",
      pageCount: 180,
      language: "English",
      availability: { totalCopies: 6, availableCopies: 6 },
      location: { shelf: "A-003", section: "Fiction", floor: "Ground Floor" }
    },
    {
      title: "Harry Potter and the Philosopher's Stone",
      author: "J.K. Rowling",
      description: "The first novel in the Harry Potter series about a young wizard's magical journey.",
      category: "Fantasy",
      code: "BOOK-005",  // Add unique code
      isbn: "9780747532699",
      publisher: "Bloomsbury",
      publishedDate: "1997-06-26",
      pageCount: 223,
      language: "English",
      availability: { totalCopies: 8, availableCopies: 8 },
      location: { shelf: "C-001", section: "Fantasy", floor: "First Floor" }
    }
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < famousBooks.length; i++) {
    const book = famousBooks[i];
    console.log(`📖 Adding book ${i + 1}/${famousBooks.length}: "${book.title}"`);
    
    try {
      const result = await makeRequest('/api/v1/admin/books', 'POST', book, token);
      
      if (result.status === 200 || result.status === 201) {
        console.log(`✅ Success: ${book.title}`);
        successCount++;
      } else {
        console.log(`❌ Failed: ${book.title} (Status: ${result.status})`);
        console.log(`   Error: ${result.data.message || JSON.stringify(result.data)}`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ Error adding ${book.title}:`, error.message);
      failCount++;
    }
  }
  
  console.log(`\n📊 Results: ✅ ${successCount} success, ❌ ${failCount} failed`);
  return successCount;
}

// Step 4: Verify books were added
async function verifyBooks(token) {
  console.log('\n🔍 Step 4: Verifying books were added...');
  
  try {
    const result = await makeRequest('/api/v1/admin/books', 'GET', null, token);
    
    if (result.status === 200) {
      const books = result.data.data || [];
      console.log(`✅ Found ${books.length} books in the database!`);
      
      if (books.length > 0) {
        console.log('\n📚 Sample books:');
        books.slice(0, 5).forEach((book, index) => {
          console.log(`   ${index + 1}. "${book.title}" by ${book.author}`);
        });
        
        if (books.length > 5) {
          console.log(`   ... and ${books.length - 5} more books`);
        }
      }
      return books.length;
    } else {
      console.log('❌ Failed to retrieve books');
      return 0;
    }
  } catch (error) {
    console.log('❌ Error verifying books:', error.message);
    return 0;
  }
}

// Main setup function
async function setupLibrary() {
  console.log('🚀 Setting up Yeka Sub-City Library with admin user and books...\n');
  
  // Step 1: Register admin
  const adminRegistered = await registerAdmin();
  if (!adminRegistered) {
    console.log('❌ Setup failed: Could not register admin user');
    return;
  }
  
  // Step 2: Login
  const token = await loginAdmin();
  if (!token) {
    console.log('❌ Setup failed: Could not login as admin');
    return;
  }
  
  // Step 3: Add books
  const booksAdded = await addFamousBooks(token);
  
  // Step 4: Verify
  const totalBooks = await verifyBooks(token);
  
  console.log('\n🎉 Setup Complete!');
  console.log('📋 Summary:');
  console.log(`   👤 Admin user: ${adminUser.email}`);
  console.log(`   🔑 Password: ${adminUser.password}`);
  console.log(`   📚 Books added: ${booksAdded}`);
  console.log(`   📖 Total books: ${totalBooks}`);
  console.log('\n💡 You can now login to the frontend with these credentials!');
}

// Run the setup
setupLibrary().catch(console.error);
