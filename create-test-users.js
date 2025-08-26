const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const config = require('./config');

// Database configuration
const dbConfig = config.database;

async function createTestUsers() {
  console.log('Creating test users for the application...\n');

  // Create connection
  const connection = mysql.createConnection(dbConfig);

  try {
    // Test users data
    const testUsers = [
      {
        name: 'Test User Customer',
        email: 'user@test.com',
        password: 'User123!',
        address: '123 Test Street, Test City, TC 12345',
        role: 'user'
      },
      {
        name: 'Test Store Owner',
        email: 'owner@test.com',
        password: 'Owner123!',
        address: '456 Business Street, Business City, BC 67890',
        role: 'store_owner'
      },
      {
        name: 'John Doe Customer',
        email: 'john@example.com',
        password: 'User123!',
        address: '789 Customer Avenue, Customer City, CC 11111',
        role: 'user'
      },
      {
        name: 'Jane Smith Owner',
        email: 'jane@example.com',
        password: 'Owner123!',
        address: '321 Owner Boulevard, Owner City, OC 22222',
        role: 'store_owner'
      }
    ];

    console.log('Adding test users...');
    
    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      await connection.promise().query(`
        INSERT INTO users (name, email, password, address, role) 
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = name
      `, [user.name, user.email, hashedPassword, user.address, user.role]);
      
      console.log(`✓ Added: ${user.name} (${user.email}) - Role: ${user.role}`);
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('\nYou can now login with these accounts:');
    console.log('\n📋 Test Accounts:');
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Role: ${user.role}`);
      console.log('');
    });

    console.log('🔑 Default Admin Account:');
    console.log('   Email: admin@storeapp.com');
    console.log('   Password: Admin123!');
    console.log('   Role: admin');

  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  } finally {
    connection.end();
  }
}

// Run the script
createTestUsers();
