'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { AVATAR_OPTIONS, BotAvatar } from './botStyles';

export default function AvatarPickerModal({ open, initialAvatar, onClose, onSelect }) {
  const [selected, setSelected] = useState(initialAvatar || AVATAR_OPTIONS[0]);

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} labelledBy="avatar-picker-title" className="max-w-md">
      <h2 id="avatar-picker-title" className="font-display text-lg font-bold text-ink-900">
        Select Bot Avatar
      </h2>
      <p className="mt-1 text-sm text-ink-600">Adding an avatar makes it easier to identify bots.</p>

      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {AVATAR_OPTIONS.map((avatar) => (
          <button
            key={avatar}
            type="button"
            onClick={() => setSelected(avatar)}
            aria-pressed={selected === avatar}
            aria-label={avatar.replace('bot-', '')}
            className={`grid place-items-center rounded-full p-1 transition-shadow ${
              selected === avatar ? 'ring-2 ring-brand-500 ring-offset-2' : ''
            }`}
          >
            <BotAvatar avatar={avatar} size="lg" />
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" fullWidth onClick={onClose}>
          Cancel
        </Button>
        <Button
          fullWidth
          onClick={() => {
            onSelect(selected);
            onClose();
          }}
        >
          Use Avatar
        </Button>
      </div>
    </Modal>
  );
}
