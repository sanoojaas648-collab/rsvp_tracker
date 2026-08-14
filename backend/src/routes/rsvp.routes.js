const express = require('express');
const { upsertRsvpHandler, listRsvpsHandler } = require('../controllers/rsvp.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.get('/:id/rsvps', listRsvpsHandler);
router.post('/:id/rsvp', requireAuth, upsertRsvpHandler);

module.exports = router;
