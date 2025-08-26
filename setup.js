const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const config = require('./config');

// Database configuration
const dbConfig = config.database;

async function setupDatabase() {
  console.log('Setting up Store Rating Application...\n');

  // Create connection without database first
  const connection = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password
  });

  try {
    // Create database if it doesn't exist
    console.log('Creating database...');
    await connection.promise().query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log('✓ Database created successfully');

    // Use the database
    await connection.promise().query(`USE ${dbConfig.database}`);

    // Create tables
    console.log('\nCreating tables...');
    
    // Users table
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        role ENUM('admin', 'user', 'store_owner') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Stores table
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        address VARCHAR(400) NOT NULL,
        owner_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✓ Stores table created');

    // Ratings table
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_store_rating (user_id, store_id)
      )
    `);
    console.log('✓ Ratings table created');

    // Create default admin user
    console.log('\nCreating default admin user...');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    await connection.promise().query(`
      INSERT INTO users (name, email, password, address, role) 
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name = name
    `, ['System Administrator', 'admin@storeapp.com', hashedPassword, 'System Address', 'admin']);
    
    console.log('✓ Default admin user created');
    console.log('  Email: admin@storeapp.com');
    console.log('  Password: Admin123!');

    // Create some sample data
    console.log('\nCreating sample data...');
    
    // Sample users
    const sampleUsers = [
      ['John Doe Customer', 'john@example.com', await bcrypt.hash('User123!', 10), '123 Main St, City, State', 'user'],
      ['Jane Smith Owner', 'jane@example.com', await bcrypt.hash('Owner123!', 10), '456 Business Ave, City, State', 'store_owner']
    ];

    for (const user of sampleUsers) {
      await connection.promise().query(`
        INSERT INTO users (name, email, password, address, role) 
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = name
      `, user);
    }
    console.log('✓ Sample users created');

    // Sample stores
    const sampleStores = [
      ['Sample Store 1', 'store1@example.com', '789 Commerce Blvd, City, State', 3],
      ['Sample Store 2', 'store2@example.com', '321 Retail Rd, City, State', null]
    ];

    for (const store of sampleStores) {
      await connection.promise().query(`
        INSERT INTO stores (name, email, address, owner_id) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = name
      `, store);
    }
    console.log('✓ Sample stores created');

    // Sample ratings
    const sampleRatings = [
      [2, 1, 4], // user 2 rates store 1 with 4 stars
      [2, 2, 5]  // user 2 rates store 2 with 5 stars
    ];

    for (const rating of sampleRatings) {
      await connection.promise().query(`
        INSERT INTO ratings (user_id, store_id, rating) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE rating = VALUES(rating)
      `, rating);
    }
    console.log('✓ Sample ratings created');

    console.log('\n🎉 Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the backend: cd backend && npm start');
    console.log('2. Start the frontend: cd frontend && npm run dev');
    console.log('3. Visit http://localhost:5173 in your browser');
    console.log('4. Login with admin@storeapp.com / Admin123!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    connection.end();
  }
}

// Run setup
setupDatabase();
