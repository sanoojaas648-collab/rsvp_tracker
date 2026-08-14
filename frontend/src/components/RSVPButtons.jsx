'use client';

import { useState } from 'react';

const OPTIONS = [
  { value: 'going', label: 'Going', icon: '✓' },
  { value: 'maybe', label: 'Maybe', icon: '?' },
  { value: 'declined', label: "Can't go", icon: '✕' }
];

export default function RSVPButtons({ currentStatus, onChange, disabled }) {
  const [pending, setPending] = useState(null);

  async function handleClick(status) {
    if (disabled || pending) return;
    setPending(status);
    try {
      await onChange(status);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {OPTIONS.map((opt) => {
        const isActive = currentStatus === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled || pending !== null}
            onClick={() => handleClick(opt.value)}
            className={`btn text-xs ${isActive ? 'btn-gold' : 'btn-outline'}`}
          >
            <span>{pending === opt.value ? '…' : opt.icon}</span>
            {pending === opt.value ? 'Saving' : opt.label}
          </button>
        );
      })}
    </div>
  );
}
