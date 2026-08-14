import Link from 'next/link';

function formatDateTime(value) {
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatStub(value) {
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return { day: '--', month: '---', weekday: '---' };
  return {
    day: date.getDate(),
    month: date.toLocaleString(undefined, { month: 'short' }).toUpperCase(),
    weekday: date.toLocaleString(undefined, { weekday: 'short' }).toUpperCase()
  };
}

export default function EventCard({ event }) {
  const { day, month, weekday } = formatStub(event.start_time);
  const totalRsvps =
    Number(event.going_count || 0) + Number(event.maybe_count || 0) + Number(event.declined_count || 0);

  return (
    <Link
      href={`/events/${event.id}`}
      className="card card-hover flex overflow-hidden group"
    >
      <div className="ticket-stub ticket-notch shrink-0 w-[76px] flex flex-col items-center justify-center py-5 border-r border-dashed border-gold/40">
        <span className="eyebrow-light !text-[9px] !tracking-widest2">{weekday}</span>
        <span className="font-display text-3xl leading-none mt-1.5">{day}</span>
        <span className="text-[10px] tracking-widest text-gold mt-1">{month}</span>
      </div>

      <div className="flex-1 min-w-0 p-5 flex flex-col gap-2.5">
        <div>
          <p className="eyebrow !text-[10px]">Hosted by {event.creator_name}</p>
          <h3 className="font-display text-lg text-ink leading-snug mt-1 group-hover:text-forest-mid transition-colors">
            {event.title}
          </h3>
        </div>

        {event.description && (
          <p className="text-sm text-ink/60 line-clamp-2 leading-relaxed">{event.description}</p>
        )}

        <div className="text-xs text-ink/55 space-y-1 mt-auto pt-1">
          <p className="flex items-center gap-1.5">
            <span className="text-gold">✦</span> {event.location}
          </p>
          <p className="flex items-center gap-1.5">
            <span className="text-gold">✦</span> {formatDateTime(event.start_time)}
          </p>
        </div>

        <div className="flex items-center gap-1.5 divider-gold pt-2.5 mt-1">
          <span className="chip chip-going">Going {event.going_count ?? 0}</span>
          <span className="chip chip-maybe">Maybe {event.maybe_count ?? 0}</span>
          {totalRsvps === 0 && (
            <span className="chip chip-outline">Not RSVP'd yet</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export { formatDateTime };
