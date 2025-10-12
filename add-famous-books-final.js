// Add 10 famous books to populate the library database
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

// Create book function
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

async function addFamousBooks() {
  console.log('📚 Adding 10 Famous Books to Yeka Sub-City Library\n');
  
  try {
    // Login
    console.log('🔐 Logging in as admin...');
    const token = await login();
    console.log('✅ Login successful\n');
    
    // Famous books data
    const famousBooks = [
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        description: "A gripping tale of racial injustice and childhood innocence in the American South. This Pulitzer Prize-winning novel explores themes of morality, prejudice, and the loss of innocence through the eyes of Scout Finch.",
        category: "Fiction",
        code: "LIB-001",
        isbn: "9780061120084",
        availability: { totalCopies: 5, availableCopies: 5 },
        location: { shelf: "A-001", section: "Fiction" },
        language: "English"
      },
      {
        title: "1984",
        author: "George Orwell",
        description: "A dystopian social science fiction novel that explores themes of totalitarianism, surveillance, and individual freedom. Set in a world of perpetual war and government surveillance.",
        category: "Science Fiction",
        code: "LIB-002",
        isbn: "9780451524935",
        availability: { totalCopies: 4, availableCopies: 4 },
        location: { shelf: "A-002", section: "Science Fiction" },
        language: "English"
      },
      {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        description: "A romantic novel that critiques the British landed gentry at the end of the 18th century. The story follows Elizabeth Bennet and her complex relationship with the proud Mr. Darcy.",
        category: "Romance",
        code: "LIB-003",
        isbn: "9780141439518",
        availability: { totalCopies: 3, availableCopies: 3 },
        location: { shelf: "B-001", section: "Romance" },
        language: "English"
      },
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        description: "A classic American novel set in the Jazz Age that explores themes of wealth, love, idealism, and moral decay in the American Dream. The story is narrated by Nick Carraway.",
        category: "Fiction",
        code: "LIB-004",
        isbn: "9780743273565",
        availability: { totalCopies: 6, availableCopies: 6 },
        location: { shelf: "A-003", section: "Fiction" },
        language: "English"
      },
      {
        title: "Harry Potter and the Philosopher's Stone",
        author: "J.K. Rowling",
        description: "The first novel in the Harry Potter series, following young Harry Potter as he discovers his magical heritage and attends Hogwarts School of Witchcraft and Wizardry.",
        category: "Fantasy",
        code: "LIB-005",
        isbn: "9780747532699",
        availability: { totalCopies: 8, availableCopies: 8 },
        location: { shelf: "C-001", section: "Fantasy" },
        language: "English"
      },
      {
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        description: "A controversial coming-of-age novel that follows teenager Holden Caulfield as he navigates the challenges of adolescence and society in New York City.",
        category: "Fiction",
        code: "LIB-006",
        isbn: "9780316769174",
        availability: { totalCopies: 4, availableCopies: 4 },
        location: { shelf: "A-004", section: "Fiction" },
        language: "English"
      },
      {
        title: "Lord of the Flies",
        author: "William Golding",
        description: "A dystopian novel about a group of British boys stranded on an uninhabited island and their disastrous attempt to govern themselves. Explores themes of civilization versus savagery.",
        category: "Fiction",
        code: "LIB-007",
        isbn: "9780571056866",
        availability: { totalCopies: 5, availableCopies: 5 },
        location: { shelf: "A-005", section: "Fiction" },
        language: "English"
      },
      {
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        description: "A fantasy adventure novel that follows hobbit Bilbo Baggins on his unexpected journey with a group of dwarves to reclaim their homeland from the dragon Smaug.",
        category: "Fantasy",
        code: "LIB-008",
        isbn: "9780547928227",
        availability: { totalCopies: 7, availableCopies: 7 },
        location: { shelf: "C-002", section: "Fantasy" },
        language: "English"
      },
      {
        title: "Brave New World",
        author: "Aldous Huxley",
        description: "A dystopian novel set in a futuristic World State where citizens are genetically modified and psychologically conditioned. Explores themes of technology, freedom, and human nature.",
        category: "Science Fiction",
        code: "LIB-009",
        isbn: "9780060850524",
        availability: { totalCopies: 4, availableCopies: 4 },
        location: { shelf: "A-006", section: "Science Fiction" },
        language: "English"
      },
      {
        title: "Jane Eyre",
        author: "Charlotte Brontë",
        description: "A bildungsroman that follows the experiences of its eponymous heroine, including her growth to adulthood and her love for Mr. Rochester. A classic of English literature.",
        category: "Romance",
        code: "LIB-010",
        isbn: "9780141441146",
        availability: { totalCopies: 3, availableCopies: 3 },
        location: { shelf: "B-002", section: "Romance" },
        language: "English"
      }
    ];
    
    let successCount = 0;
    let failCount = 0;
    
    console.log('📖 Adding books to the library...\n');
    
    for (let i = 0; i < famousBooks.length; i++) {
      const book = famousBooks[i];
      console.log(`${i + 1}. Adding "${book.title}" by ${book.author}`);
      
      try {
        const result = await createBook(token, book);
        
        if (result.status === 200 || result.status === 201) {
          console.log(`   ✅ Added successfully (Code: ${book.code})`);
          successCount++;
        } else {
          console.log(`   ❌ Failed: ${result.data.message || 'Unknown error'}`);
          failCount++;
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        failCount++;
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 Results Summary:');
    console.log(`✅ Successfully added: ${successCount} books`);
    console.log(`❌ Failed to add: ${failCount} books`);
    console.log(`📚 Total books processed: ${famousBooks.length}`);
    
    if (successCount === famousBooks.length) {
      console.log('\n🎉 SUCCESS! All famous books have been added to the library!');
      console.log('\n📋 Library is now populated with:');
      console.log('   • Classic Literature (To Kill a Mockingbird, Pride and Prejudice, Jane Eyre)');
      console.log('   • Modern Fiction (The Great Gatsby, The Catcher in the Rye, Lord of the Flies)');
      console.log('   • Fantasy (Harry Potter, The Hobbit)');
      console.log('   • Science Fiction (1984, Brave New World)');
      console.log('\n🚀 You can now test the frontend with real book data!');
    } else {
      console.log('\n⚠️ Some books failed to add. Check the errors above.');
    }
    
  } catch (error) {
    console.log('❌ Failed to add books:', error.message);
  }
}

addFamousBooks();
