const mysql = require('mysql2');
const config = require('./config');

// Database configuration
const dbConfig = config.database;

async function createSampleStores() {
  console.log('Creating sample stores for testing...\n');

  // Create connection
  const connection = mysql.createConnection(dbConfig);

  try {
    // Sample stores data
    const sampleStores = [
      {
        name: 'TechMart Electronics',
        email: 'techmart@example.com',
        address: '123 Technology Drive, Silicon Valley, CA 94025',
        owner_id: null
      },
      {
        name: 'Fresh Grocery Store',
        email: 'freshgrocery@example.com',
        address: '456 Market Street, Downtown, NY 10001',
        owner_id: null
      },
      {
        name: 'Fashion Boutique',
        email: 'fashionboutique@example.com',
        address: '789 Style Avenue, Fashion District, LA 90210',
        owner_id: null
      },
      {
        name: 'Coffee Corner',
        email: 'coffeecorner@example.com',
        address: '321 Brew Street, Coffee Town, WA 98101',
        owner_id: null
      },
      {
        name: 'Sports Equipment Store',
        email: 'sportsequipment@example.com',
        address: '654 Athletic Road, Sports City, TX 75001',
        owner_id: null
      },
      {
        name: 'Book Haven',
        email: 'bookhaven@example.com',
        address: '987 Literary Lane, Reading Town, MA 02101',
        owner_id: null
      },
      {
        name: 'Home Decor Plus',
        email: 'homedecor@example.com',
        address: '147 Design Drive, Interior City, FL 33101',
        owner_id: null
      },
      {
        name: 'Pet Paradise',
        email: 'petparadise@example.com',
        address: '258 Animal Avenue, Pet City, IL 60601',
        owner_id: null
      }
    ];

    console.log('Adding sample stores...');
    
    for (const store of sampleStores) {
      await connection.promise().query(`
        INSERT INTO stores (name, email, address, owner_id) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = name
      `, [store.name, store.email, store.address, store.owner_id]);
      
      console.log(`✓ Added: ${store.name}`);
    }

    console.log('\n🎉 Sample stores created successfully!');
    console.log('\nNow users can see and rate these stores:');
    sampleStores.forEach((store, index) => {
      console.log(`${index + 1}. ${store.name} - ${store.address}`);
    });

  } catch (error) {
    console.error('❌ Error creating sample stores:', error.message);
  } finally {
    connection.end();
  }
}

// Run the script
createSampleStores();
