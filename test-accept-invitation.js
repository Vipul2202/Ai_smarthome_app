// Test script to verify acceptHouseInvitation mutation
const fetch = require('node-fetch');

const GRAPHQL_URL = 'http://192.168.29.65:4000/graphql';

async function testAcceptInvitation(inviteCode, token) {
  const mutation = `
    mutation AcceptHouseInvitation($input: AcceptHouseInvitationInput!) {
      acceptHouseInvitation(input: $input) {
        id
        name
        description
        userRole
        createdDate
      }
    }
  `;

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          inviteCode: inviteCode,
        },
      },
    }),
  });

  const result = await response.json();
  console.log('Response:', JSON.stringify(result, null, 2));
  
  if (result.errors) {
    console.error('GraphQL Errors:', result.errors);
  }
  
  if (result.data) {
    console.log('Success! House data:', result.data.acceptHouseInvitation);
  }
}

// Usage: node test-accept-invitation.js <inviteCode> <authToken>
const inviteCode = process.argv[2];
const token = process.argv[3];

if (!inviteCode || !token) {
  console.log('Usage: node test-accept-invitation.js <inviteCode> <authToken>');
  console.log('Example: node test-accept-invitation.js abc123def456 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  process.exit(1);
}

testAcceptInvitation(inviteCode, token).catch(console.error);
