// Script to add 10 famous books by default
const http = require('http');

const API_BASE_URL = 'http://localhost:3000';

// 10 Famous Books Data
const famousBooks = [
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "A gripping tale of racial injustice and childhood innocence in the American South. This Pulitzer Prize-winning novel explores themes of morality, prejudice, and the loss of innocence through the eyes of Scout Finch.",
    category: "Fiction",
    isbn: "9780061120084",
    publisher: "J.B. Lippincott & Co.",
    publishedDate: "1960-07-11",
    pageCount: 376,
    language: "English",
    availability: {
      totalCopies: 5,
      availableCopies: 5
    },
    location: {
      shelf: "A-001",
      section: "Fiction",
      floor: "Ground Floor"
    }
  },
  {
    title: "1984",
    author: "George Orwell",
    description: "A dystopian social science fiction novel that explores themes of totalitarianism, surveillance, and individual freedom. Set in a world of perpetual war and government surveillance.",
    category: "Fiction",
    isbn: "9780451524935",
    publisher: "Secker & Warburg",
    publishedDate: "1949-06-08",
    pageCount: 328,
    language: "English",
    availability: {
      totalCopies: 4,
      availableCopies: 4
    },
    location: {
      shelf: "A-002",
      section: "Fiction",
      floor: "Ground Floor"
    }
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "A romantic novel that critiques the British landed gentry at the end of the 18th century. The story follows Elizabeth Bennet and her complex relationship with the proud Mr. Darcy.",
    category: "Romance",
    isbn: "9780141439518",
    publisher: "T. Egerton",
    publishedDate: "1813-01-28",
    pageCount: 432,
    language: "English",
    availability: {
      totalCopies: 3,
      availableCopies: 3
    },
    location: {
      shelf: "B-001",
      section: "Romance",
      floor: "Ground Floor"
    }
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "A classic American novel set in the Jazz Age that explores themes of wealth, love, idealism, and moral decay in the American Dream. The story is narrated by Nick Carraway.",
    category: "Fiction",
    isbn: "9780743273565",
    publisher: "Charles Scribner's Sons",
    publishedDate: "1925-04-10",
    pageCount: 180,
    language: "English",
    availability: {
      totalCopies: 6,
      availableCopies: 6
    },
    location: {
      shelf: "A-003",
      section: "Fiction",
      floor: "Ground Floor"
    }
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    description: "The first novel in the Harry Potter series, following young Harry Potter as he discovers his magical heritage and attends Hogwarts School of Witchcraft and Wizardry.",
    category: "Fantasy",
    isbn: "9780747532699",
    publisher: "Bloomsbury",
    publishedDate: "1997-06-26",
    pageCount: 223,
    language: "English",
    availability: {
      totalCopies: 8,
      availableCopies: 8
    },
    location: {
      shelf: "C-001",
      section: "Fantasy",
      floor: "First Floor"
    }
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    description: "A controversial coming-of-age novel that follows teenager Holden Caulfield as he navigates the challenges of adolescence and society in New York City.",
    category: "Fiction",
    isbn: "9780316769174",
    publisher: "Little, Brown and Company",
    publishedDate: "1951-07-16",
    pageCount: 277,
    language: "English",
    availability: {
      totalCopies: 4,
      availableCopies: 4
    },
    location: {
      shelf: "A-004",
      section: "Fiction",
      floor: "Ground Floor"
    }
  },
  {
    title: "Lord of the Flies",
    author: "William Golding",
    description: "A dystopian novel about a group of British boys stranded on an uninhabited island and their disastrous attempt to govern themselves. Explores themes of civilization versus savagery.",
    category: "Fiction",
    isbn: "9780571056866",
    publisher: "Faber & Faber",
    publishedDate: "1954-09-17",
    pageCount: 224,
    language: "English",
    availability: {
      totalCopies: 5,
      availableCopies: 5
    },
    location: {
      shelf: "A-005",
      section: "Fiction",
      floor: "Ground Floor"
    }
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    description: "A fantasy adventure novel that follows hobbit Bilbo Baggins on his unexpected journey with a group of dwarves to reclaim their homeland from the dragon Smaug.",
    category: "Fantasy",
    isbn: "9780547928227",
    publisher: "George Allen & Unwin",
    publishedDate: "1937-09-21",
    pageCount: 310,
    language: "English",
    availability: {
      totalCopies: 7,
      availableCopies: 7
    },
    location: {
      shelf: "C-002",
      section: "Fantasy",
      floor: "First Floor"
    }
  },
  {
    title: "Brave New World",
    author: "Aldous Huxley",
    description: "A dystopian novel set in a futuristic World State where citizens are genetically modified and psychologically conditioned. Explores themes of technology, freedom, and human nature.",
    category: "Science Fiction",
    isbn: "9780060850524",
    publisher: "Chatto & Windus",
    publishedDate: "1932-08-30",
    pageCount: 268,
    language: "English",
    availability: {
      totalCopies: 4,
      availableCopies: 4
    },
    location: {
      shelf: "D-001",
      section: "Science Fiction",
      floor: "First Floor"
    }
  },
  {
    title: "Jane Eyre",
    author: "Charlotte Brontë",
    description: "A bildungsroman that follows the experiences of its eponymous heroine, including her growth to adulthood and her love for Mr. Rochester. A classic of English literature.",
    category: "Romance",
    isbn: "9780141441146",
    publisher: "Smith, Elder & Co.",
    publishedDate: "1847-10-16",
    pageCount: 507,
    language: "English",
    availability: {
      totalCopies: 3,
      availableCopies: 3
    },
    location: {
      shelf: "B-002",
      section: "Romance",
      floor: "Ground Floor"
    }
  }
];

// Function to make HTTP POST request
function addBook(bookData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(bookData);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/admin/books',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
        // Removed Authorization header for testing with simple backend
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// Main function to add all books
async function addAllBooks() {
  console.log('🚀 Starting to add 10 famous books to the library...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < famousBooks.length; i++) {
    const book = famousBooks[i];
    console.log(`📚 Adding book ${i + 1}/10: "${book.title}" by ${book.author}`);
    
    try {
      const result = await addBook(book);
      
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
    
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Summary:');
  console.log(`✅ Successfully added: ${successCount} books`);
  console.log(`❌ Failed to add: ${failCount} books`);
  console.log(`📚 Total books processed: ${famousBooks.length}`);
}

// Run the script
addAllBooks().catch(console.error);
