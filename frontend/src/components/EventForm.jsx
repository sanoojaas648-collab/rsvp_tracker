'use client';

import { useState } from 'react';

function toLocalInputValue(value) {
  if (!value) return '';
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default function EventForm({ initialEvent, onSubmit, submitLabel = 'Create meetup' }) {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [startTime, setStartTime] = useState(toLocalInputValue(initialEvent?.start_time));
  const [endTime, setEndTime] = useState(toLocalInputValue(initialEvent?.end_time));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim() || !location.trim() || !startTime || !endTime) {
      setError('Title, location, start time, and end time are all required.');
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      setError('End time must be after start time.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim(),
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString()
      });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-7 flex flex-col gap-5 max-w-xl">
      {error && (
        <div className="text-sm text-clay bg-clay/10 border border-clay/30 rounded-sm px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label className="label" htmlFor="title">Title</label>
        <input
          id="title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Kochi Frontend Meetup"
          maxLength={200}
        />
      </div>

      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea
          id="description"
          className="input"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What should people expect?"
        />
      </div>

      <div>
        <label className="label" htmlFor="location">Location</label>
        <input
          id="location"
          className="input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Infopark, Kochi"
          maxLength={255}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="start_time">Start</label>
          <input
            id="start_time"
            type="datetime-local"
            className="input"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="end_time">End</label>
          <input
            id="end_time"
            type="datetime-local"
            className="input"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary self-start mt-1" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
