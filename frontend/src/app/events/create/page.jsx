'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import EventForm from '@/components/EventForm';

export default function CreateEventPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  async function handleSubmit(payload) {
    const result = await api.createEvent(payload, token);
    router.push(`/events/${result.event.id}`);
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <p className="text-sm text-ink/40">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <p className="eyebrow mb-3">New meetup</p>
      <h1 className="font-display text-3xl text-ink mb-1">Host something</h1>
      <p className="text-sm text-ink/50 mb-8">Fill in the details — you can edit this later.</p>
      <EventForm onSubmit={handleSubmit} submitLabel="Create meetup" />
    </div>
  );
}
