const rsvpService = require('../services/rsvp.service');
const eventService = require('../services/event.service');
const { ApiError } = require('../middleware/error.middleware');

async function upsertRsvpHandler(req, res, next) {
  try {
    const eventId = Number(req.params.id);
    if (!Number.isInteger(eventId)) {
      throw new ApiError(400, 'Invalid event id.');
    }

    const { status } = req.body || {};
    if (!rsvpService.ALLOWED_STATUSES.includes(status)) {
      throw new ApiError(
        400,
        `Invalid status. Must be one of: ${rsvpService.ALLOWED_STATUSES.join(', ')}.`
      );
    }

    const event = await eventService.getEventById(eventId);
    if (!event) {
      throw new ApiError(404, 'Event not found.');
    }

    const rsvp = await rsvpService.upsertRsvp(eventId, req.user.id, status);
    return res.status(200).json({ rsvp });
  } catch (err) {
    return next(err);
  }
}

async function listRsvpsHandler(req, res, next) {
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
    return res.status(200).json({ attendees });
  } catch (err) {
    return next(err);
  }
}

module.exports = { upsertRsvpHandler, listRsvpsHandler };
