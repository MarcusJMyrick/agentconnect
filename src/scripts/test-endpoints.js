const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testEndpoints() {
  try {
    console.log('Testing API endpoints...\n');

    // Test team members endpoint
    console.log('Testing /team-members endpoint...');
    const teamMembersResponse = await axios.get(`${API_URL}/team-members`);
    console.log('Team Members Response:', {
      status: teamMembersResponse.status,
      count: teamMembersResponse.data.length,
      data: teamMembersResponse.data
    });

    // Test agents endpoint
    console.log('\nTesting /agents endpoint...');
    const agentsResponse = await axios.get(`${API_URL}/agents`);
    console.log('Agents Response:', {
      status: agentsResponse.status,
      count: agentsResponse.data.length,
      data: agentsResponse.data
    });

    // Test tasks endpoint
    console.log('\nTesting /tasks endpoint...');
    const tasksResponse = await axios.get(`${API_URL}/tasks`);
    console.log('Tasks Response:', {
      status: tasksResponse.status,
      count: tasksResponse.data.length,
      data: tasksResponse.data
    });

  } catch (error) {
    console.error('Error testing endpoints:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testEndpoints(); 