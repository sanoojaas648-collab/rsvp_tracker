const eventService = require('../services/event.service');
const rsvpService = require('../services/rsvp.service');
const { ApiError } = require('../middleware/error.middleware');

function validateEventPayload(body) {
  const { title, location, start_time, end_time } = body || {};

  if (!title || !String(title).trim()) {
    throw new ApiError(400, 'Title is required.');
  }
  if (!location || !String(location).trim()) {
    throw new ApiError(400, 'Location is required.');
  }
  if (!start_time) {
    throw new ApiError(400, 'start_time is required.');
  }
  if (!end_time) {
    throw new ApiError(400, 'end_time is required.');
  }

  const start = new Date(start_time);
  const end = new Date(end_time);

  if (Number.isNaN(start.getTime())) {
    throw new ApiError(400, 'start_time is not a valid date.');
  }
  if (Number.isNaN(end.getTime())) {
    throw new ApiError(400, 'end_time is not a valid date.');
  }
  if (end.getTime() <= start.getTime()) {
    throw new ApiError(400, 'end_time must be after start_time.');
  }

  return {
    title: String(title).trim(),
    description: body.description ? String(body.description).trim() : null,
    location: String(location).trim(),
    start_time: start.toISOString().slice(0, 19).replace('T', ' '),
    end_time: end.toISOString().slice(0, 19).replace('T', ' ')
  };
}

async function listEventsHandler(req, res, next) {
  try {
    const events = await eventService.listEvents();
    return res.status(200).json({ events });
  } catch (err) {
    return next(err);
  }
}

async function getEventHandler(req, res, next) {
  try {
    const eventId = Number(req.params.id);
    if (!Number.isInteger(eventId)) {
      throw new ApiError(400, 'Invalid event id.');
    }

    const event = await eventService.getEventById(eventId);
    if (!event) {
      throw new ApiError(404, 'Event not found.');
    }

    const attendees = await rsvpService.listRsvpsForEvent(eventId);

    // req.user is only set for authenticated requests; the details
    // endpoint is viewable while logged out, so guard against undefined.
    const myRsvp = req.user
      ? await rsvpService.getUserRsvpForEvent(eventId, req.user.id)
      : null;

    return res.status(200).json({ event, attendees, my_rsvp: myRsvp });
  } catch (err) {
    return next(err);
  }
}

async function createEventHandler(req, res, next) {
  try {
    const payload = validateEventPayload(req.body);
    const event = await eventService.createEvent({
      ...payload,
      created_by: req.user.id
    });
    return res.status(201).json({ event });
  } catch (err) {
    return next(err);
  }
}

async function updateEventHandler(req, res, next) {
  try {
    const eventId = Number(req.params.id);
    if (!Number.isInteger(eventId)) {
      throw new ApiError(400, 'Invalid event id.');
    }

    const existing = await eventService.getEventById(eventId);
    if (!existing) {
      throw new ApiError(404, 'Event not found.');
    }

    if (existing.created_by !== req.user.id) {
      throw new ApiError(403, 'You do not have permission to edit this event.');
    }

    const payload = validateEventPayload(req.body);
    const event = await eventService.updateEvent(eventId, payload);
    return res.status(200).json({ event });
  } catch (err) {
    return next(err);
  }
}

async function deleteEventHandler(req, res, next) {
  try {
    const eventId = Number(req.params.id);
    if (!Number.isInteger(eventId)) {
      throw new ApiError(400, 'Invalid event id.');
    }

    const existing = await eventService.getEventById(eventId);
    if (!existing) {
      throw new ApiError(404, 'Event not found.');
    }

    if (existing.created_by !== req.user.id) {
      throw new ApiError(403, 'You do not have permission to delete this event.');
    }

    await eventService.deleteEvent(eventId);
    return res.status(200).json({ message: 'Event deleted.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listEventsHandler,
  getEventHandler,
  createEventHandler,
  updateEventHandler,
  deleteEventHandler
};
