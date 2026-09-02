'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Download, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import DashboardShell from '@/components/dashboard/DashboardShell';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const STORAGE_PREFIX = 'wizjobai_cv_';

const textareaClass =
  'w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-[0.925rem] text-ink-900 placeholder:text-ink-400 transition-colors focus:border-brand-400';

let uid = 0;
function newId() {
  uid += 1;
  return `${Date.now()}-${uid}`;
}

function emptyExperience() {
  return { id: newId(), role: '', company: '', start: '', end: '', description: '' };
}

function emptyEducation() {
  return { id: newId(), school: '', qualification: '', start: '', end: '' };
}

function buildInitialCv(user) {
  return {
    fullName: user?.name || '',
    headline: user?.profile?.headline || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    location: user?.profile?.location || '',
    summary: user?.profile?.bio || '',
    skills: (user?.profile?.skills || []).join(', '),
    experience: [emptyExperience()],
    education: [emptyEducation()],
  };
}

export default function ManageCvsPage() {
  const { user } = useAuth();
  const storageKey = useMemo(
    () => `${STORAGE_PREFIX}${user?._id || user?.id || user?.email || 'draft'}`,
    [user]
  );

  const [cv, setCv] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const loadedRef = useRef(false);

  // Load a saved draft for this user (if any), otherwise seed the form from
  // their profile so the builder isn't blank on first visit.
  useEffect(() => {
    if (!user || loadedRef.current) return;
    loadedRef.current = true;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        setCv(JSON.parse(raw));
        return;
      }
    } catch {
      // fall through to a fresh draft
    }
    setCv(buildInitialCv(user));
  }, [user, storageKey]);

  // Autosave (debounced) whenever the draft changes.
  useEffect(() => {
    if (!cv) return;
    const timeout = setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(cv));
        setSavedAt(new Date());
      } catch {
        // localStorage unavailable (e.g. private mode) - silently skip
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [cv, storageKey]);

  if (!cv) {
    return (
      <DashboardShell title="CV Builder">
        <div className="grid min-h-[40vh] place-items-center text-sm text-ink-500">Loading your builder…</div>
      </DashboardShell>
    );
  }

  const setField = (field) => (e) => setCv((c) => ({ ...c, [field]: e.target.value }));

  const updateEntry = (listKey, id, field, value) => {
    setCv((c) => ({
      ...c,
      [listKey]: c[listKey].map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)),
    }));
  };

  const addEntry = (listKey, factory) => {
    setCv((c) => ({ ...c, [listKey]: [...c[listKey], factory()] }));
  };

  const removeEntry = (listKey, id) => {
    setCv((c) => ({ ...c, [listKey]: c[listKey].filter((entry) => entry.id !== id) }));
  };

  const skillsList = cv.skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const handleDownload = () => {
    window.print();
  };

  return (
    <DashboardShell title="CV Builder">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Build your CV</h1>
          <p className="mt-1 text-sm text-ink-600">
            Fill in your details on the left - the preview on the right updates as you type.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden items-center gap-1.5 text-xs text-ink-400 sm:flex">
            {savedAt && (
              <>
                <Check size={14} className="text-accent-teal" />
                Saved {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </>
            )}
          </span>
          <Button onClick={handleDownload}>
            <Download size={16} />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="cv-builder-form flex flex-col gap-6">
          <section className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft">
            <h2 className="font-display text-base font-bold text-ink-900">Personal details</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Full name" value={cv.fullName} onChange={setField('fullName')} placeholder="Ada Lovelace" />
              <Input
                label="Headline"
                value={cv.headline}
                onChange={setField('headline')}
                placeholder="Senior Product Designer"
              />
              <Input label="Email" value={cv.email} onChange={setField('email')} placeholder="you@example.com" />
              <Input label="Phone" value={cv.phone} onChange={setField('phone')} placeholder="+1 555 000 0000" />
              <Input
                label="Location"
                value={cv.location}
                onChange={setField('location')}
                containerClassName="sm:col-span-2"
                placeholder="Lagos, Nigeria"
              />
            </div>
          </section>

          <section className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft">
            <h2 className="font-display text-base font-bold text-ink-900">Summary</h2>
            <textarea
              rows={4}
              value={cv.summary}
              onChange={setField('summary')}
              placeholder="A short summary of your experience and what you're looking for."
              className={`mt-3 ${textareaClass}`}
            />
          </section>

          <section className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft">
            <h2 className="font-display text-base font-bold text-ink-900">Skills</h2>
            <p className="mt-1 text-xs text-ink-500">Comma-separated, e.g. Figma, User Research, Prototyping</p>
            <textarea
              rows={2}
              value={cv.skills}
              onChange={setField('skills')}
              placeholder="Figma, User Research, Prototyping"
              className={`mt-3 ${textareaClass}`}
            />
          </section>

          <section className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-ink-900">Experience</h2>
              <Button variant="secondary" className="h-9 px-3 text-xs" onClick={() => addEntry('experience', emptyExperience)}>
                <Plus size={14} />
                Add role
              </Button>
            </div>
            <div className="mt-4 flex flex-col gap-5">
              {cv.experience.map((entry, i) => (
                <div key={entry.id} className="rounded-xl border border-ink-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Role {i + 1}</p>
                    {cv.experience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEntry('experience', entry.id)}
                        className="text-ink-400 hover:text-red-600"
                        aria-label="Remove role"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      label="Job title"
                      value={entry.role}
                      onChange={(e) => updateEntry('experience', entry.id, 'role', e.target.value)}
                      placeholder="Product Designer"
                    />
                    <Input
                      label="Company"
                      value={entry.company}
                      onChange={(e) => updateEntry('experience', entry.id, 'company', e.target.value)}
                      placeholder="Acme Inc."
                    />
                    <Input
                      label="Start date"
                      value={entry.start}
                      onChange={(e) => updateEntry('experience', entry.id, 'start', e.target.value)}
                      placeholder="Jan 2022"
                    />
                    <Input
                      label="End date"
                      value={entry.end}
                      onChange={(e) => updateEntry('experience', entry.id, 'end', e.target.value)}
                      placeholder="Present"
                    />
                  </div>
                  <textarea
                    rows={3}
                    value={entry.description}
                    onChange={(e) => updateEntry('experience', entry.id, 'description', e.target.value)}
                    placeholder="What did you own or ship in this role?"
                    className={`mt-3 ${textareaClass}`}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-ink-900">Education</h2>
              <Button variant="secondary" className="h-9 px-3 text-xs" onClick={() => addEntry('education', emptyEducation)}>
                <Plus size={14} />
                Add education
              </Button>
            </div>
            <div className="mt-4 flex flex-col gap-5">
              {cv.education.map((entry, i) => (
                <div key={entry.id} className="rounded-xl border border-ink-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Education {i + 1}</p>
                    {cv.education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEntry('education', entry.id)}
                        className="text-ink-400 hover:text-red-600"
                        aria-label="Remove education"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      label="School"
                      value={entry.school}
                      onChange={(e) => updateEntry('education', entry.id, 'school', e.target.value)}
                      placeholder="University of Lagos"
                    />
                    <Input
                      label="Qualification"
                      value={entry.qualification}
                      onChange={(e) => updateEntry('education', entry.id, 'qualification', e.target.value)}
                      placeholder="B.Sc. Computer Science"
                    />
                    <Input
                      label="Start date"
                      value={entry.start}
                      onChange={(e) => updateEntry('education', entry.id, 'start', e.target.value)}
                      placeholder="2016"
                    />
                    <Input
                      label="End date"
                      value={entry.end}
                      onChange={(e) => updateEntry('education', entry.id, 'end', e.target.value)}
                      placeholder="2020"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Preview */}
        <div className="cv-builder-preview lg:sticky lg:top-6 lg:self-start">
          <div id="cv-preview" className="rounded-xl2 border border-ink-100 bg-white p-8 shadow-panel">
            <h2 className="font-display text-2xl font-bold text-ink-900">{cv.fullName || 'Your name'}</h2>
            {cv.headline && <p className="mt-1 text-sm font-medium text-brand-600">{cv.headline}</p>}
            <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-500">
              {cv.email && <span>{cv.email}</span>}
              {cv.phone && <span>{cv.phone}</span>}
              {cv.location && <span>{cv.location}</span>}
            </p>

            {cv.summary && (
              <div className="mt-5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-ink-400">Summary</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-700">{cv.summary}</p>
              </div>
            )}

            {skillsList.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-ink-400">Skills</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {skillsList.map((skill) => (
                    <span key={skill} className="rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {cv.experience.some((e) => e.role || e.company) && (
              <div className="mt-5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-ink-400">Experience</h3>
                <div className="mt-2 flex flex-col gap-4">
                  {cv.experience
                    .filter((e) => e.role || e.company)
                    .map((entry) => (
                      <div key={entry.id}>
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-semibold text-ink-900">
                            {entry.role || 'Role'}{' '}
                            {entry.company && <span className="font-normal text-ink-600">· {entry.company}</span>}
                          </p>
                          {(entry.start || entry.end) && (
                            <p className="shrink-0 text-xs text-ink-400">
                              {entry.start} {entry.start && entry.end ? '–' : ''} {entry.end}
                            </p>
                          )}
                        </div>
                        {entry.description && (
                          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-600">{entry.description}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {cv.education.some((e) => e.school || e.qualification) && (
              <div className="mt-5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-ink-400">Education</h3>
                <div className="mt-2 flex flex-col gap-3">
                  {cv.education
                    .filter((e) => e.school || e.qualification)
                    .map((entry) => (
                      <div key={entry.id} className="flex items-baseline justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-ink-900">{entry.school || 'School'}</p>
                          {entry.qualification && <p className="text-xs text-ink-600">{entry.qualification}</p>}
                        </div>
                        {(entry.start || entry.end) && (
                          <p className="shrink-0 text-xs text-ink-400">
                            {entry.start} {entry.start && entry.end ? '–' : ''} {entry.end}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          <p className="mt-3 text-center text-xs text-ink-400">
            Your draft autosaves to this device. Use "Download PDF" to save or share it.
          </p>
        </div>
      </div>

      {/* Print styles: isolate the preview card when downloading/printing. */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #cv-preview,
          #cv-preview * {
            visibility: visible;
          }
          #cv-preview {
            position: absolute;
            inset: 0;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </DashboardShell>
  );
}
