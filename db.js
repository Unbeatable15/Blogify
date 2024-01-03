const {
  Pool
} = require('pg');
require('dotenv').config();

const connectionString = process.env.CONNECTION_STRING;

// Create a new pool using the connection string
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // May or may not be required based on your ElephantSQL settings
  }
});



module.exports = pool;