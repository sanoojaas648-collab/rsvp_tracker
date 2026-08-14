'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import EventCard from '@/components/EventCard';

const FILTERS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'all', label: 'All' },
  { value: 'past', label: 'Past' }
];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading'); 
  const [query, setQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('upcoming');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus('loading');
      try {
        const data = await api.listEvents();
        if (!cancelled) {
          setEvents(data.events || []);
          setStatus('ready');
        }
      } catch (err) {
        if (!cancelled) setStatus('error');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    const now = Date.now();
    const q = query.trim().toLowerCase();

    return events.filter((event) => {
      const isPast = new Date(event.start_time.replace(' ', 'T')).getTime() < now;
      if (timeFilter === 'upcoming' && isPast) return false;
      if (timeFilter === 'past' && !isPast) return false;

      if (!q) return true;
      const haystack = `${event.title} ${event.location} ${event.creator_name}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [events, query, timeFilter]);

  return (
    <div>
      <section className="bg-forest text-ivory">
        <div className="max-w-6xl mx-auto px-4 py-14 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="eyebrow-light mb-3">
              {events.length ? `${events.length} meetups on the board` : 'The board'}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl leading-tight">
              Local meetups,<br />properly hosted.
            </h1>
            <div className="rule-gold mt-5" />
          </div>
          <Link href="/events/create" className="btn btn-gold text-xs self-start sm:self-auto">
            + Create a meetup
          </Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-7 pb-16">
        <div className="card flex flex-col sm:flex-row gap-3 p-3 mb-8">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold text-sm">✦</span>
            <input
              type="text"
              className="input pl-9 border-transparent focus:border-gold"
              placeholder="Search by title, location, or host…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1 bg-ivory-dim rounded-sm p-1 self-start sm:self-auto">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setTimeFilter(f.value)}
                className={`text-xs uppercase tracking-widest font-semibold px-3.5 py-2 rounded-sm transition-colors ${
                  timeFilter === f.value
                    ? 'bg-forest text-ivory'
                    : 'text-ink/50 hover:text-ink'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {status === 'loading' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 h-48 flex gap-4">
                <div className="skeleton w-[60px] shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-5 w-3/4" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === 'error' && (
          <div className="card p-10 text-center text-sm text-clay">
            Couldn't load events right now. Please refresh the page to try again.
          </div>
        )}

        {status === 'ready' && events.length === 0 && (
          <div className="card p-12 text-center">
            <p className="rule-gold mx-auto mb-4" />
            <p className="font-display text-2xl mb-1">No meetups yet</p>
            <p className="text-sm text-ink/50 mb-6">Be the first to create one.</p>
            <Link href="/events/create" className="btn btn-primary text-xs">
              + Create meetup
            </Link>
          </div>
        )}

        {status === 'ready' && events.length > 0 && filteredEvents.length === 0 && (
          <div className="card p-12 text-center">
            <p className="font-display text-2xl mb-1">No matches</p>
            <p className="text-sm text-ink/50">Try a different search or filter.</p>
          </div>
        )}

        {status === 'ready' && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
