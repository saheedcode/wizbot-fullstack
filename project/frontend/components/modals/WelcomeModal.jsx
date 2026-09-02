'use client';

import { Sparkles } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function WelcomeModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="welcome-modal-title">
      <div className="grid h-40 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-teal text-white">
        <Sparkles size={40} strokeWidth={1.5} />
      </div>
      <h2 id="welcome-modal-title" className="mt-5 text-center font-display text-lg font-bold text-ink-900">
        Welcome to WizJobAI
      </h2>
      <p className="mt-2 text-center text-sm text-ink-600">
        We&apos;re glad to have you onboard. Wizbot can scan and auto-apply to jobs that match your
        profile, so let&apos;s get you set up and running.
      </p>
      <Button fullWidth className="mt-6" onClick={onClose}>
        Close
      </Button>
    </Modal>
  );
}
