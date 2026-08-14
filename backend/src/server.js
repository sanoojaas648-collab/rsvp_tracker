require('dotenv').config();

const app = require('./app');
const { waitForDatabase } = require('./config/db');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await waitForDatabase();
    app.listen(PORT, () => {
      console.log(`[server] Meetup RSVP API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  }
}

start();
