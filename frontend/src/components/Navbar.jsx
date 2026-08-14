'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-forest text-ivory border-b border-gold/30">
      <div className="max-w-6xl mx-auto px-4 h-[68px] flex items-center justify-between">
        <Link href="/events" className="flex items-center gap-2.5 group">
          <span className="w-8 h-8 border border-gold flex items-center justify-center rotate-45">
            <span className="w-1.5 h-1.5 bg-gold -rotate-45" />
          </span>
          <span className="font-display text-xl tracking-wide">
            Meetup<span className="text-gold">RSVP</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/events"
            className="hidden sm:inline text-xs uppercase tracking-widest text-ivory/70 hover:text-gold px-2 py-1.5 transition-colors"
          >
            Browse
          </Link>

          {!isLoading && isAuthenticated && (
            <>
              <Link href="/events/create" className="btn btn-gold text-xs">
                + New meetup
              </Link>
              <span className="text-xs text-ivory/50 hidden md:inline pl-1 tracking-wide">
                {user?.name}
              </span>
              <button type="button" onClick={logout} className="btn btn-outline-light text-xs">
                Log out
              </button>
            </>
          )}

          {!isLoading && !isAuthenticated && (
            <Link href="/login" className="btn btn-gold text-xs">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
