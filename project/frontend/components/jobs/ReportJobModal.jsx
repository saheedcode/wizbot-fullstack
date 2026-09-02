'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { jobsApi } from '@/lib/api';
import { REPORT_REASONS } from './utils';

export default function ReportJobModal({ open, job, onClose }) {
  const [reason, setReason] = useState(REPORT_REASONS[0].value);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | done
  const [error, setError] = useState('');

  if (!open || !job) return null;

  const handleClose = () => {
    setStatus('idle');
    setReason(REPORT_REASONS[0].value);
    setDescription('');
    setError('');
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('submitting');
    try {
      await jobsApi.report(job._id, { reason, description: description.trim() || undefined });
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  return (
    <Modal open={open} onClose={handleClose} labelledBy="report-job-title">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-amber-50 text-amber-600">
        <Flag size={20} />
      </div>

      {status === 'done' ? (
        <>
          <h2 id="report-job-title" className="mt-4 font-display text-lg font-bold text-ink-900">
            Report submitted
          </h2>
          <p className="mt-2 text-sm text-ink-600">
            Thanks for flagging &ldquo;{job.title}&rdquo;. Our team will review it shortly.
          </p>
          <Button fullWidth className="mt-6" onClick={handleClose}>
            Done
          </Button>
        </>
      ) : (
        <form onSubmit={submit}>
          <h2 id="report-job-title" className="mt-4 font-display text-lg font-bold text-ink-900">
            Report &ldquo;{job.title}&rdquo;
          </h2>
          <p className="mt-1 text-sm text-ink-600">Let us know what&rsquo;s wrong with this listing.</p>

          <label className="mt-4 block text-sm font-medium text-ink-700">Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-900 focus:border-brand-400"
          >
            {REPORT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <label className="mt-4 block text-sm font-medium text-ink-700">
            Details <span className="font-normal text-ink-400">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={2000}
            className="mt-1.5 w-full resize-none rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-400"
            placeholder="Anything else we should know?"
          />

          {error && <Alert type="error" className="mt-4">{error}</Alert>}

          <div className="mt-6 flex gap-3">
            <Button type="button" variant="secondary" fullWidth onClick={handleClose} disabled={status === 'submitting'}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" fullWidth isLoading={status === 'submitting'}>
              Submit report
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
