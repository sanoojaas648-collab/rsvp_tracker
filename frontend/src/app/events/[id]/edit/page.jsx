'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import EventForm from '@/components/EventForm';

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [event, setEvent] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | notfound | forbidden | error

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await api.getEvent(id, token);
      setEvent(data.event);
      setStatus('ready');
    } catch (err) {
      if (err.status === 404) setStatus('notfound');
      else setStatus('error');
    }
  }, [id, token]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!authLoading && isAuthenticated) {
      load();
    }
  }, [authLoading, isAuthenticated, load, router]);

  async function handleSubmit(payload) {
    await api.updateEvent(id, payload, token);
    router.push(`/events/${id}`);
  }

  if (authLoading || status === 'loading') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <p className="text-sm text-ink/40">Loading…</p>
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="card p-12 text-center max-w-md mx-auto">
          <p className="font-display text-2xl mb-1">Event not found</p>
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
  if (user && event.created_by !== user.id) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="card p-7 text-sm text-clay">
          You don't have permission to edit this event.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <p className="eyebrow mb-3">Edit meetup</p>
      <h1 className="font-display text-3xl text-ink mb-8">{event.title}</h1>
      <EventForm initialEvent={event} onSubmit={handleSubmit} submitLabel="Save changes" />
    </div>
  );
}
