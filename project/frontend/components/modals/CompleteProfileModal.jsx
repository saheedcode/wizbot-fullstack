'use client';

import Link from 'next/link';
import { UserCircle2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function CompleteProfileModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="complete-profile-modal-title">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600">
        <UserCircle2 size={22} />
      </div>
      <h2 id="complete-profile-modal-title" className="mt-4 font-display text-lg font-bold text-ink-900">
        Complete profile
      </h2>
      <p className="mt-2 text-sm text-ink-600">
        Add your headline, skills, and job preferences so Wizbot and recruiters can match you with
        the right roles.
      </p>
      <Link href="/onboarding" className="mt-6 block">
        <Button fullWidth onClick={onClose}>
          Go to profile
        </Button>
      </Link>
    </Modal>
  );
}
