'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { botsApi } from '@/lib/api';
import { AVATAR_OPTIONS, BotAvatar } from './botStyles';
import AvatarPickerModal from './AvatarPickerModal';

export default function EditBotModal({ open, bot, onClose, onUpdated }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bot) {
      setName(bot.name || '');
      setAvatar(bot.avatar || AVATAR_OPTIONS[0]);
      setError('');
      setNameError('');
    }
  }, [bot, open]);

  if (!open || !bot) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setNameError('Bot name must be at least 2 characters.');
      return;
    }
    setNameError('');
    setError('');
    setIsSubmitting(true);
    try {
      const res = await botsApi.update(bot._id, { name: name.trim(), avatar });
      onUpdated?.(res.data.bot);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal open={open && !avatarPickerOpen} onClose={handleClose} labelledBy="edit-bot-title" className="max-w-md">
        <h2 id="edit-bot-title" className="font-display text-lg font-bold text-ink-900">
          Edit Bot
        </h2>
        <p className="mt-1 text-sm text-ink-600">You can customize your bot&apos;s name and avatar only.</p>

        {error && <Alert type="error" className="mt-4">{error}</Alert>}

        <form onSubmit={handleSubmit} className="mt-5 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setAvatarPickerOpen(true)}
            className="flex flex-col items-center gap-1.5 text-xs font-medium text-ink-600"
          >
            <BotAvatar avatar={avatar} size="lg" className="ring-2 ring-offset-2" />
            Choose Avatar
          </button>
          <Input
            label="Bot Name"
            placeholder="e.g. Software Engineer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError}
            containerClassName="flex-1"
          />
        </form>

        <div className="mt-6 flex gap-3">
          <Button variant="secondary" fullWidth onClick={handleClose} disabled={isSubmitting}>
            Close
          </Button>
          <Button fullWidth isLoading={isSubmitting} onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </Modal>

      <AvatarPickerModal
        open={avatarPickerOpen}
        initialAvatar={avatar}
        onClose={() => setAvatarPickerOpen(false)}
        onSelect={setAvatar}
      />
    </>
  );
}
