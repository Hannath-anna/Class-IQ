const mysql = require('mysql2');
require('dotenv').config(); // Load environment variables

// Create a connection pool instead of a single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Adjust limit based on your expected traffic
  queueLimit: 0
});

// Optional: Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database pool:', err.stack);
        return;
    }
    console.log('Successfully connected to the database pool as ID ' + connection.threadId);
    connection.release(); // Release the connection back to the pool
});

// Export the pool to be used in your models
module.exports = pool;