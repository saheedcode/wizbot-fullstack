'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export default function LogoutConfirmModal({ open, onClose }) {
  const { logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push('/login');
  };

  return (
    <Modal open={open} onClose={isLoggingOut ? undefined : onClose} labelledBy="logout-modal-title">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-600">
        <LogOut size={20} />
      </div>
      <h2 id="logout-modal-title" className="mt-4 font-display text-lg font-bold text-ink-900">
        Log out account
      </h2>
      <p className="mt-2 text-sm text-ink-600">
        Are you sure you want to log out? You&apos;ll need to sign in again to access your dashboard.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" fullWidth onClick={onClose} disabled={isLoggingOut}>
          Cancel
        </Button>
        <Button variant="danger" fullWidth onClick={handleLogout} isLoading={isLoggingOut}>
          Log out
        </Button>
      </div>
    </Modal>
  );
}
