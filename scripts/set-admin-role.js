/**
 * Script to set admin role for a user in Clerk
 * Run: node scripts/set-admin-role.js <user-email>
 */

const { clerkClient } = require('@clerk/nextjs/server');

async function setAdminRole(userEmail) {
  try {
    console.log(`Setting admin role for user: ${userEmail}`);
    
    // Initialize Clerk client using the async pattern
    const client = await clerkClient();
    
    // Find user by email
    const users = await client.users.getUserList({
      emailAddress: [userEmail]
    });
    
    if (users.data.length === 0) {
      console.error(`User with email ${userEmail} not found`);
      return;
    }
    
    const user = users.data[0];
    console.log(`Found user: ${user.id} - ${user.firstName} ${user.lastName}`);
    
    // Update user's public metadata to set admin role
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        role: 'admin'
      }
    });
    
    console.log(`✅ Successfully set admin role for user: ${userEmail}`);
    console.log(`User ID: ${user.id}`);
    console.log(`Admin panel will now work for this user.`);
    
  } catch (error) {
    console.error('Error setting admin role:', error);
  }
}

// Get email from command line arguments
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('Please provide user email as argument');
  console.error('Usage: node scripts/set-admin-role.js <user-email>');
  process.exit(1);
}

setAdminRole(userEmail);