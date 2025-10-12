// Simple test script to verify dashboard API endpoints
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';

async function testDashboardEndpoints() {
  console.log('🧪 Testing Dashboard API Endpoints...\n');

  const endpoints = [
    '/dashboard/overview',
    '/dashboard/borrowed-books',
    '/dashboard/reserved-books',
    '/dashboard/reading-history',
    '/admin/announcements'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing: ${endpoint}`);
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      
      if (response.data.success) {
        console.log(`✅ ${endpoint} - SUCCESS`);
        console.log(`   Data keys: ${Object.keys(response.data.data || {}).join(', ')}`);
      } else {
        console.log(`❌ ${endpoint} - FAILED: ${response.data.message}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - ERROR: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data?.message || 'Unknown error'}`);
      }
    }
    console.log('');
  }

  // Test POST endpoints
  console.log('🧪 Testing POST Endpoints...\n');
  
  const postEndpoints = [
    '/dashboard/send-reminder/test-book-id',
    '/dashboard/renew-book/test-book-id',
    '/dashboard/return-book/test-book-id'
  ];

  for (const endpoint of postEndpoints) {
    try {
      console.log(`📡 Testing: ${endpoint}`);
      const response = await axios.post(`${API_BASE_URL}${endpoint}`);
      
      if (response.data.success) {
        console.log(`✅ ${endpoint} - SUCCESS`);
        console.log(`   Message: ${response.data.message}`);
      } else {
        console.log(`❌ ${endpoint} - FAILED: ${response.data.message}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - ERROR: ${error.message}`);
    }
    console.log('');
  }
}

testDashboardEndpoints().catch(console.error);
