const { Client } = require('pg');
require('dotenv').config();

async function checkUsers() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    const res = await client.query('SELECT id, email, password FROM users');
    console.log('Users in completed_backend:');
    res.rows.forEach(row => {
      console.log(`ID: ${row.id}, Email: ${row.email}, Password: ${row.password.substring(0, 20)}...`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkUsers();