const { pool } = require('../config/db');

const ALLOWED_STATUSES = ['going', 'maybe', 'declined'];

async function upsertRsvp(eventId, userId, status) {
  await pool.query(
    `INSERT INTO rsvps (event_id, user_id, status)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status)`,
    [eventId, userId, status]
  );

  const [rows] = await pool.query(
    `SELECT id, event_id, user_id, status, created_at, updated_at
     FROM rsvps WHERE event_id = ? AND user_id = ? LIMIT 1`,
    [eventId, userId]
  );
  return rows[0];
}

async function listRsvpsForEvent(eventId) {
  const [rows] = await pool.query(
    `SELECT r.status, u.id AS user_id, u.name
     FROM rsvps r
     JOIN users u ON u.id = r.user_id
     WHERE r.event_id = ?
     ORDER BY u.name ASC`,
    [eventId]
  );

  const grouped = { going: [], maybe: [], declined: [] };
  for (const row of rows) {
    grouped[row.status].push({ user_id: row.user_id, name: row.name });
  }
  return grouped;
}

async function getUserRsvpForEvent(eventId, userId) {
  const [rows] = await pool.query(
    'SELECT status FROM rsvps WHERE event_id = ? AND user_id = ? LIMIT 1',
    [eventId, userId]
  );
  return rows[0] ? rows[0].status : null;
}

module.exports = { ALLOWED_STATUSES, upsertRsvp, listRsvpsForEvent, getUserRsvpForEvent };
