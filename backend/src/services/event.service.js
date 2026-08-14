const { pool } = require('../config/db');

async function listEvents() {
  const [rows] = await pool.query(
    `SELECT
        e.id, e.title, e.description, e.location, e.start_time, e.end_time,
        e.created_by, e.created_at, e.updated_at,
        u.name AS creator_name,
        COALESCE(SUM(r.status = 'going'), 0) AS going_count,
        COALESCE(SUM(r.status = 'maybe'), 0) AS maybe_count,
        COALESCE(SUM(r.status = 'declined'), 0) AS declined_count
     FROM events e
     JOIN users u ON u.id = e.created_by
     LEFT JOIN rsvps r ON r.event_id = e.id
     GROUP BY e.id
     ORDER BY e.start_time ASC`
  );
  return rows;
}

async function getEventById(eventId) {
  const [rows] = await pool.query(
    `SELECT
        e.id, e.title, e.description, e.location, e.start_time, e.end_time,
        e.created_by, e.created_at, e.updated_at,
        u.name AS creator_name
     FROM events e
     JOIN users u ON u.id = e.created_by
     WHERE e.id = ?
     LIMIT 1`,
    [eventId]
  );
  return rows[0] || null;
}

async function createEvent({ title, description, location, start_time, end_time, created_by }) {
  const [result] = await pool.query(
    `INSERT INTO events (title, description, location, start_time, end_time, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description || null, location, start_time, end_time, created_by]
  );
  return getEventById(result.insertId);
}

async function updateEvent(eventId, { title, description, location, start_time, end_time }) {
  await pool.query(
    `UPDATE events
     SET title = ?, description = ?, location = ?, start_time = ?, end_time = ?
     WHERE id = ?`,
    [title, description || null, location, start_time, end_time, eventId]
  );
  return getEventById(eventId);
}

async function deleteEvent(eventId) {
  await pool.query('DELETE FROM events WHERE id = ?', [eventId]);
}

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
