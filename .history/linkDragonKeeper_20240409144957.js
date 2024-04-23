const LinkDragonScribe = require('./linkDragonScribe');

const agentName = 'LinkDragonKeeper'; 
const password = 'your_password'; // amend with pass from users.json
const chatroom = 'general';
const socketUrl = 'https://chat.themultiverse.school:3535/';

const agent = new LinkDragonScribe(agentName, password, chatroom, socketUrl);
agent.connect();
agent.login();

const { Pool } = require('pg');
const fs = require('fs').promises;

// Create a new pool instance
const pool = new Pool({
  user: 'your-username',
  host: 'your-neon-host',
  database: 'your-database',
  password: 'your-password',
  port: 5432,
});

async function loadJsonAndInsert() {
  try {
    // Load your JSON data
    const data = JSON.parse(await fs.readFile('your_data.json', 'utf8'));

    // Get a client from the pool
    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Insert data into your table
      for (const item of data) {
        await client.query(
          'INSERT INTO my_table (column1, column2) VALUES ($1, $2)',
          [item['json_key1'], item['json_key2']]
        );
      }

      // Commit transaction
      await client.query('COMMIT');
    } catch (err) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      throw err;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (err) {
    console.error('Failed to load JSON data and insert into the database:', err);
  }
}

// Execute the function
loadJsonAndInsert().then(() => console.log('Data loaded and inserted successfully.'));
