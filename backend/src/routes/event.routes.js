const express = require('express');
const {
  listEventsHandler,
  getEventHandler,
  createEventHandler,
  updateEventHandler,
  deleteEventHandler
} = require('../controllers/event.controller');
const { requireAuth, optionalAuth } = require('../middleware/auth.middleware');
const rsvpRoutes = require('./rsvp.routes');

const router = express.Router();

router.get('/', optionalAuth, listEventsHandler);
router.get('/:id', optionalAuth, getEventHandler);

router.post('/', requireAuth, createEventHandler);
router.put('/:id', requireAuth, updateEventHandler);
router.delete('/:id', requireAuth, deleteEventHandler);

router.use('/', rsvpRoutes);

module.exports = router;
