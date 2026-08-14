const authService = require('../services/auth.service');
const { ApiError } = require('../middleware/error.middleware');

async function loginHandler(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required.');
    }

    const result = await authService.login(String(email).trim().toLowerCase(), password);

    if (!result) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function meHandler(req, res) {
  return res.status(200).json({ user: req.user });
}

module.exports = { loginHandler, meHandler };
