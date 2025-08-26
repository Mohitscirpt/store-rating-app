const mysql = require('mysql2');
const config = require('./config');

// Database configuration
const dbConfig = config.database;

async function testDatabase() {
  console.log('Testing database connection and store visibility...\n');

  // Create connection
  const connection = mysql.createConnection(dbConfig);

  try {
    // Test 1: Check if tables exist
    console.log('1. Checking if tables exist...');
    const [tables] = await connection.promise().query('SHOW TABLES');
    console.log('✓ Tables found:', tables.map(t => Object.values(t)[0]));

    // Test 2: Check stores count
    console.log('\n2. Checking stores in database...');
    const [stores] = await connection.promise().query('SELECT COUNT(*) as count FROM stores');
    console.log(`✓ Total stores: ${stores[0].count}`);

    if (stores[0].count > 0) {
      const [storeList] = await connection.promise().query('SELECT id, name, address FROM stores LIMIT 5');
      console.log('✓ Sample stores:');
      storeList.forEach(store => {
        console.log(`   - ${store.name} (ID: ${store.id})`);
      });
    } else {
      console.log('⚠ No stores found. Run setup.js first to create sample data.');
    }

    // Test 3: Check users count
    console.log('\n3. Checking users in database...');
    const [users] = await connection.promise().query('SELECT COUNT(*) as count FROM users');
    console.log(`✓ Total users: ${users[0].count}`);

    if (users[0].count > 0) {
      const [userList] = await connection.promise().query('SELECT id, name, email, role FROM users LIMIT 5');
      console.log('✓ Sample users:');
      userList.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }

    // Test 4: Simulate the stores API query that users see
    console.log('\n4. Testing stores API query (what users see)...');
    const [storeResults] = await connection.promise().query(`
      SELECT s.id, s.name, s.address, 
             AVG(r.rating) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s 
      LEFT JOIN ratings r ON s.id = r.store_id 
      GROUP BY s.id
      ORDER BY s.name ASC
    `);
    
    console.log(`✓ Stores visible to users: ${storeResults.length}`);
    storeResults.forEach(store => {
      console.log(`   - ${store.name}`);
      console.log(`     Address: ${store.address}`);
      console.log(`     Average Rating: ${store.average_rating ? parseFloat(store.average_rating).toFixed(1) : 'No ratings'}`);
      console.log(`     Total Ratings: ${store.total_ratings || 0}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.log('\n💡 Try running: node setup.js first to create the database and tables.');
  } finally {
    connection.end();
  }
}

// Run the test
testDatabase();
