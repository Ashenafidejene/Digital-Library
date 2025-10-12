// Test script to verify add book endpoint
const http = require('http');

const testData = JSON.stringify({
  title: "Test Book",
  author: "Test Author",
  category: "Fiction",
  bookNumber: "BK-001",
  shelfNumber: "A-1-001",
  totalCopies: 1,
  isbn: "",
  publisher: "",
  publicationDate: "",
  pages: 0,
  language: "English",
  location: "A-1-001",
  description: ""
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/admin/books',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('🧪 Testing add book endpoint...');
console.log('📤 Sending data:', testData);

const req = http.request(options, (res) => {
  console.log('📥 Response status:', res.statusCode);
  console.log('📥 Response headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📥 Response body:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('📥 Parsed response:', parsed);
    } catch (e) {
      console.log('❌ Failed to parse response as JSON');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.write(testData);
req.end();
