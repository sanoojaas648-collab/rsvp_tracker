const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

if (!JWT_SECRET) {
  // Fail loudly at boot rather than silently signing tokens with `undefined`.
  throw new Error('JWT_SECRET environment variable is required but not set.');
}

/**
 * Authenticates a user by email + password.
 * Returns { token, user } on success, or null if credentials are invalid.
 * Never returns password_hash.
 */
async function login(email, password) {
  const [rows] = await pool.query(
    'SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  if (rows.length === 0) {
    return null;
  }

  const user = rows[0];
  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return null;
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email }
  };
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { login, verifyToken };
