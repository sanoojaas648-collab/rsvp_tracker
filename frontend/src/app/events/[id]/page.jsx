'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import RSVPButtons from '@/components/RSVPButtons';
import { formatDateTime } from '@/components/EventCard';

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState({ going: [], maybe: [], declined: [] });
  const [myRsvp, setMyRsvp] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | notfound | error
  const [rsvpError, setRsvpError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await api.getEvent(id, token);
      setEvent(data.event);
      setAttendees(data.attendees);
      setMyRsvp(data.my_rsvp);
      setStatus('ready');
    } catch (err) {
      if (err.status === 404) {
        setStatus('notfound');
      } else {
        setStatus('error');
      }
    }
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRsvpChange(newStatus) {
    setRsvpError('');
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      await api.rsvp(id, newStatus, token);
      await load();
    } catch (err) {
      setRsvpError(err.message || 'Could not update your RSVP.');
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm('Delete this meetup? This cannot be undone.');
    if (!confirmed) return;

    setDeleteError('');
    setIsDeleting(true);
    try {
      await api.deleteEvent(id, token);
      router.push('/events');
    } catch (err) {
      setDeleteError(err.message || 'Could not delete this event.');
      setIsDeleting(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="max-w-2xl space-y-4">
          <div className="skeleton h-4 w-32" />
          <div className="card p-7 space-y-3">
            <div className="skeleton h-8 w-2/3" />
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="card p-12 text-center max-w-md mx-auto">
          <p className="font-display text-2xl mb-1">Event not found</p>
          <p className="text-sm text-ink/50 mb-6">It may have been deleted.</p>
          <Link href="/events" className="btn btn-outline text-xs">Back to events</Link>
        </div>
      </div>
    );
  }

  if (status === 'error' || !event) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="card p-7 text-sm text-clay">
          Couldn't load this event. Please refresh the page to try again.
        </div>
      </div>
    );
  }

  const isOwner = isAuthenticated && user && user.id === event.created_by;
  const totalAttendees =
    attendees.going.length + attendees.maybe.length + attendees.declined.length;

  return (
    <div>
      <section className="bg-forest text-ivory">
        <div className="max-w-6xl mx-auto px-4 pt-10 pb-16">
          <Link
            href="/events"
            className="text-xs uppercase tracking-widest text-ivory/50 hover:text-gold inline-flex items-center gap-1.5"
          >
            ← Back to events
          </Link>

          <div className="flex items-start justify-between gap-6 mt-6 flex-wrap">
            <div>
              <p className="eyebrow-light mb-3">Hosted by {event.creator_name}</p>
              <h1 className="font-display text-3xl sm:text-4xl leading-tight max-w-2xl">
                {event.title}
              </h1>
              <div className="rule-gold mt-5" />
            </div>

            {isOwner && (
              <div className="flex gap-2 shrink-0">
                <Link href={`/events/${event.id}/edit`} className="btn btn-outline-light text-xs">
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="btn text-xs border border-clay text-clay hover:bg-clay hover:text-ivory"
                >
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            )}
          </div>

          {deleteError && (
            <p className="text-sm text-clay mt-4">{deleteError}</p>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-7">
              {event.description && (
                <p className="text-sm text-ink/70 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              )}

              <div className="text-sm text-ink/70 mt-5 pt-5 divider grid grid-cols-1 sm:grid-cols-2 gap-3">
                <p className="flex items-center gap-2">
                  <span className="text-gold">✦</span> {event.location}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-gold">✦</span>
                  {formatDateTime(event.start_time)} → {formatDateTime(event.end_time)}
                </p>
              </div>
            </div>

            <div className="card p-7">
              <p className="eyebrow mb-4">Your response</p>
              {!isAuthenticated ? (
                <p className="text-sm text-ink/60">
                  <Link href="/login" className="text-forest underline font-medium">Log in</Link> to RSVP to this meetup.
                </p>
              ) : (
                <>
                  <RSVPButtons currentStatus={myRsvp} onChange={handleRsvpChange} />
                  {rsvpError && <p className="text-sm text-clay mt-3">{rsvpError}</p>}
                </>
              )}
            </div>
          </div>

       
          <div className="card p-7 h-fit">
            <p className="eyebrow mb-1">Guest list</p>
            <p className="font-display text-2xl text-ink mb-5">
              {totalAttendees} {totalAttendees === 1 ? 'reply' : 'replies'}
            </p>

            {totalAttendees === 0 ? (
              <p className="text-sm text-ink/40">No RSVPs yet.</p>
            ) : (
              <div className="space-y-5">
                <AttendeeGroup label="Going" chipClass="chip-going" people={attendees.going} />
                <AttendeeGroup label="Maybe" chipClass="chip-maybe" people={attendees.maybe} />
                <AttendeeGroup label="Declined" chipClass="chip-declined" people={attendees.declined} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendeeGroup({ label, chipClass, people }) {
  if (people.length === 0) return null;
  return (
    <div>
      <span className={`chip ${chipClass} mb-2.5`}>{label} {people.length}</span>
      <ul className="text-sm text-ink/70 space-y-1.5 mt-2.5">
        {people.map((p) => (
          <li key={p.user_id} className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-gold" />
            {p.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
