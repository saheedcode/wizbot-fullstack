'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { jobsApi } from '@/lib/api';

export default function DeleteJobModal({ open, job, onClose, onDeleted }) {
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!open || !job) return null;

  const handleDelete = async () => {
    setError('');
    setIsDeleting(true);
    try {
      await jobsApi.remove(job._id);
      onDeleted?.(job._id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal open={open} onClose={isDeleting ? undefined : onClose} labelledBy="delete-job-title">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-600">
        <Trash2 size={20} />
      </div>
      <h2 id="delete-job-title" className="mt-4 font-display text-lg font-bold text-ink-900">
        Delete &ldquo;{job.title}&rdquo;?
      </h2>
      <p className="mt-2 text-sm text-ink-600">
        This will permanently remove this job posting from the board. Job seekers won&apos;t be able to
        view or apply to it anymore. This can&apos;t be undone.
      </p>

      {error && <Alert type="error" className="mt-4">{error}</Alert>}

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" fullWidth onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="danger" fullWidth onClick={handleDelete} isLoading={isDeleting}>
          Delete Job
        </Button>
      </div>
    </Modal>
  );
}
