const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'app_password',
  database: process.env.DB_NAME || 'meetup_rsvp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

async function waitForDatabase(retries = 20, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const connection = await pool.getConnection();
      connection.release();
      console.log('[db] Connected to MySQL successfully.');
      return;
    } catch (err) {
      console.log(
        `[db] MySQL not ready yet (attempt ${attempt}/${retries}): ${err.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('[db] Could not connect to MySQL after multiple retries.');
}

module.exports = { pool, waitForDatabase };
