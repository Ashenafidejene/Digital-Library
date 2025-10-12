/**
 * Script to populate the database with sample users and borrowing data
 * Run this script to add realistic test data to your digital library
 */

const sampleUsers = [
  {
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@example.com',
    phone: '+251911234567',
    role: 'user',
    status: 'active',
    membershipType: 'premium',
    joinDate: '2024-01-15',
    lastActive: '2024-08-19'
  },
  {
    name: 'Fatima Mohammed',
    email: 'fatima.mohammed@example.com',
    phone: '+251922345678',
    role: 'user',
    status: 'active',
    membershipType: 'basic',
    joinDate: '2024-02-10',
    lastActive: '2024-08-18'
  },
  {
    name: 'Dawit Tekle',
    email: 'dawit.tekle@example.com',
    phone: '+251933456789',
    role: 'user',
    status: 'active',
    membershipType: 'student',
    joinDate: '2024-03-05',
    lastActive: '2024-08-19'
  },
  {
    name: 'Meron Alemayehu',
    email: 'meron.alemayehu@example.com',
    phone: '+251944567890',
    role: 'user',
    status: 'active',
    membershipType: 'basic',
    joinDate: '2024-01-20',
    lastActive: '2024-08-17'
  },
  {
    name: 'Yohannes Berhe',
    email: 'yohannes.berhe@example.com',
    phone: '+251955678901',
    role: 'user',
    status: 'suspended',
    membershipType: 'basic',
    joinDate: '2023-12-15',
    lastActive: '2024-08-10'
  }
];

const sampleBorrowings = [
  // Active borrowings
  {
    userId: '1',
    bookId: '1',
    bookTitle: 'የአማርኛ ሥነ-ጽሑፍ ታሪክ',
    bookAuthor: 'ዶ/ር ገብረ ሂወት ባይከዳኝ',
    borrowDate: '2024-08-01',
    dueDate: '2024-08-22',
    status: 'active',
    renewalCount: 0
  },
  {
    userId: '1',
    bookId: '2',
    bookTitle: 'The Great Gatsby',
    bookAuthor: 'F. Scott Fitzgerald',
    borrowDate: '2024-08-05',
    dueDate: '2024-08-26',
    status: 'active',
    renewalCount: 1
  },
  {
    userId: '2',
    bookId: '3',
    bookTitle: 'ፍቅር እስከ መቃብር',
    bookAuthor: 'ሃዲስ ዓለማየሁ',
    borrowDate: '2024-07-20',
    dueDate: '2024-08-10', // Overdue
    status: 'active',
    renewalCount: 0
  },
  {
    userId: '3',
    bookId: '4',
    bookTitle: 'To Kill a Mockingbird',
    bookAuthor: 'Harper Lee',
    borrowDate: '2024-08-10',
    dueDate: '2024-08-31',
    status: 'active',
    renewalCount: 0
  },
  {
    userId: '3',
    bookId: '5',
    bookTitle: '1984',
    bookAuthor: 'George Orwell',
    borrowDate: '2024-08-12',
    dueDate: '2024-09-02',
    status: 'active',
    renewalCount: 0
  },
  {
    userId: '3',
    bookId: '6',
    bookTitle: 'የተወለደ ንጉሥ',
    bookAuthor: 'ዳኛቸው ወርቁ',
    borrowDate: '2024-07-25',
    dueDate: '2024-08-15', // Overdue
    status: 'active',
    renewalCount: 1
  },
  {
    userId: '4',
    bookId: '7',
    bookTitle: 'Pride and Prejudice',
    bookAuthor: 'Jane Austen',
    borrowDate: '2024-08-08',
    dueDate: '2024-08-29',
    status: 'active',
    renewalCount: 0
  },
  {
    userId: '5',
    bookId: '8',
    bookTitle: 'Brave New World',
    bookAuthor: 'Aldous Huxley',
    borrowDate: '2024-07-15',
    dueDate: '2024-08-05', // Overdue
    status: 'active',
    renewalCount: 2
  }
];

const sampleBookingRequests = [
  {
    userId: '2',
    bookId: '9',
    bookTitle: 'The Hobbit',
    bookAuthor: 'J.R.R. Tolkien',
    requestDate: '2024-08-18',
    status: 'pending',
    priority: 1
  },
  {
    userId: '3',
    bookId: '10',
    bookTitle: 'Harry Potter and the Philosopher\'s Stone',
    bookAuthor: 'J.K. Rowling',
    requestDate: '2024-08-17',
    status: 'pending',
    priority: 2
  },
  {
    userId: '4',
    bookId: '11',
    bookTitle: 'የሰላሳ ዓመት ጦርነት',
    bookAuthor: 'በዓሉ ግርማ',
    requestDate: '2024-08-16',
    status: 'pending',
    priority: 3
  }
];

// Function to calculate days between dates
function calculateDaysLeft(dueDate) {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Function to display sample data summary
function displayDataSummary() {
  console.log('\n📊 SAMPLE DATA SUMMARY');
  console.log('='.repeat(50));
  
  console.log(`\n👥 Users: ${sampleUsers.length}`);
  sampleUsers.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.name} (${user.membershipType}) - ${user.status}`);
  });
  
  console.log(`\n📚 Active Borrowings: ${sampleBorrowings.length}`);
  const overdueCount = sampleBorrowings.filter(b => calculateDaysLeft(b.dueDate) < 0).length;
  console.log(`   - Overdue: ${overdueCount}`);
  console.log(`   - On time: ${sampleBorrowings.length - overdueCount}`);
  
  console.log(`\n⏳ Pending Requests: ${sampleBookingRequests.length}`);
  
  console.log('\n📋 BORROWING DETAILS:');
  sampleBorrowings.forEach((borrowing, index) => {
    const daysLeft = calculateDaysLeft(borrowing.dueDate);
    const status = daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`;
    console.log(`  ${index + 1}. "${borrowing.bookTitle}" - ${status}`);
  });
  
  console.log('\n✅ This data demonstrates:');
  console.log('   - Users with different membership types');
  console.log('   - Active borrowings with various due dates');
  console.log('   - Overdue books for clearance testing');
  console.log('   - Pending book requests');
  console.log('   - Mixed Amharic and English content');
}

// Run the summary display
displayDataSummary();

console.log('\n🚀 To use this data:');
console.log('   1. The backend already includes this sample data');
console.log('   2. Visit http://localhost:3001/admin/users to see the enhanced interface');
console.log('   3. Test the clearance check functionality');
console.log('   4. View user details and borrowing history');
console.log('   5. Try the sorting and filtering features');

module.exports = {
  sampleUsers,
  sampleBorrowings,
  sampleBookingRequests,
  calculateDaysLeft
};
