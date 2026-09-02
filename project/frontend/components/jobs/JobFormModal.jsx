'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { jobsApi } from '@/lib/api';

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const WORK_MODES = ['Remote', 'Hybrid', 'Onsite'];

const emptyForm = {
  title: '',
  company: '',
  companyLogoUrl: '',
  location: '',
  employmentType: 'Full-time',
  workMode: 'Remote',
  salaryMin: '',
  salaryMax: '',
  currency: 'USD',
  description: '',
  requirements: '',
  skills: '',
};

// Builds the edit form's initial state from a job record, turning array
// fields back into the newline/comma-separated text the inputs use.
const formFromJob = (job) => ({
  title: job.title || '',
  company: job.company || '',
  companyLogoUrl: job.companyLogoUrl || '',
  location: job.location || '',
  employmentType: job.employmentType || 'Full-time',
  workMode: job.workMode || 'Remote',
  salaryMin: job.salaryMin ?? '',
  salaryMax: job.salaryMax ?? '',
  currency: job.currency || 'USD',
  description: job.description || '',
  requirements: (job.requirements || []).join('\n'),
  skills: (job.skills || []).join(', '),
});

/**
 * Create/edit modal for job postings. Used by admins and recruiters from the
 * Discover Jobs page. Pass `job` to edit an existing posting, or omit it to
 * create a new one.
 */
export default function JobFormModal({ open, job, onClose, onSaved }) {
  const isEditing = !!job;
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(job ? formFromJob(job) : emptyForm);
      setErrors({});
      setServerError('');
    }
  }, [open, job]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const validate = () => {
    const next = {};
    if (form.title.trim().length < 2) next.title = 'Title must be at least 2 characters.';
    if (!form.company.trim()) next.company = 'Company is required.';
    if (!form.location.trim()) next.location = 'Location is required.';
    if (!form.description.trim()) next.description = 'Description is required.';
    if (form.salaryMin && form.salaryMax && Number(form.salaryMin) > Number(form.salaryMax)) {
      next.salaryMax = 'Max salary must be greater than min salary.';
    }
    if (form.companyLogoUrl.trim()) {
      try {
        // eslint-disable-next-line no-new
        new URL(form.companyLogoUrl.trim());
      } catch {
        next.companyLogoUrl = 'Must be a valid URL.';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      employmentType: form.employmentType,
      workMode: form.workMode,
      currency: form.currency.trim() || 'USD',
      description: form.description.trim(),
      requirements: form.requirements
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      ...(form.companyLogoUrl.trim() ? { companyLogoUrl: form.companyLogoUrl.trim() } : {}),
      ...(form.salaryMin ? { salaryMin: Number(form.salaryMin) } : {}),
      ...(form.salaryMax ? { salaryMax: Number(form.salaryMax) } : {}),
    };

    setIsSubmitting(true);
    try {
      const res = isEditing ? await jobsApi.update(job._id, payload) : await jobsApi.create(payload);
      onSaved?.(res.data.job);
      onClose();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      labelledBy="job-form-title"
      className="max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <h2 id="job-form-title" className="font-display text-lg font-bold text-ink-900">
        {isEditing ? 'Edit Job Posting' : 'Post a New Job'}
      </h2>
      <p className="mt-1 text-sm text-ink-600">
        {isEditing
          ? 'Update the details below. Changes are visible to job seekers immediately.'
          : 'Fill in the details below to publish a new listing to the job board.'}
      </p>

      {serverError && (
        <Alert type="error" className="mt-4">
          {serverError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Job Title" placeholder="e.g. Senior Product Designer" value={form.title} onChange={set('title')} error={errors.title} />
          <Input label="Company" placeholder="e.g. Acme Inc." value={form.company} onChange={set('company')} error={errors.company} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Location" placeholder="e.g. San Francisco, CA" value={form.location} onChange={set('location')} error={errors.location} />
          <Input
            label="Company Logo URL"
            placeholder="https://…"
            value={form.companyLogoUrl}
            onChange={set('companyLogoUrl')}
            error={errors.companyLogoUrl}
            hint="Optional"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Employment Type</label>
            <select
              value={form.employmentType}
              onChange={set('employmentType')}
              className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-[0.925rem] text-ink-900 transition-colors focus:border-brand-400"
            >
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Work Mode</label>
            <select
              value={form.workMode}
              onChange={set('workMode')}
              className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-[0.925rem] text-ink-900 transition-colors focus:border-brand-400"
            >
              {WORK_MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <Input label="Currency" placeholder="USD" value={form.currency} onChange={set('currency')} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Min Salary" type="number" min="0" placeholder="e.g. 80000" value={form.salaryMin} onChange={set('salaryMin')} />
          <Input label="Max Salary" type="number" min="0" placeholder="e.g. 120000" value={form.salaryMax} onChange={set('salaryMax')} error={errors.salaryMax} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={set('description')}
            placeholder="Describe the role, responsibilities, and what makes it a great opportunity…"
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-[0.925rem] text-ink-900 placeholder:text-ink-400 transition-colors focus:border-brand-400 ${
              errors.description ? 'border-red-400' : 'border-ink-200'
            }`}
          />
          {errors.description && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.description}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Requirements</label>
          <textarea
            rows={3}
            value={form.requirements}
            onChange={set('requirements')}
            placeholder={'One requirement per line, e.g.\n5+ years of relevant experience\nStrong communication skills'}
            className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-[0.925rem] text-ink-900 placeholder:text-ink-400 transition-colors focus:border-brand-400"
          />
        </div>

        <Input
          label="Skills"
          placeholder="e.g. React, Node.js, MongoDB"
          hint="Comma separated."
          value={form.skills}
          onChange={set('skills')}
        />

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Publish Job'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
