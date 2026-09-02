'use client';

import { useMemo, useState } from 'react';
import {
  Building2,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Plus,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useScheduler } from '@/context/SchedulerContext';
import { useNotifications } from '@/context/NotificationsContext';

const INTERVIEW_TYPES = [
  { value: 'Phone call', icon: Phone },
  { value: 'Video call', icon: Video },
  { value: 'Onsite', icon: Building2 },
];

const EMPTY_FORM = {
  jobTitle: '',
  company: '',
  date: '',
  time: '',
  type: 'Video call',
  location: '',
  notes: '',
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTimeLabel(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function SchedulePage() {
  const { upcoming, past, scheduleInterview, cancelInterview, completeInterview, deleteInterview } = useScheduler();
  const { addNotification } = useNotifications();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [view, setView] = useState('list'); // list | calendar
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDay, setSelectedDay] = useState(null);

  const openModal = (prefillDate) => {
    setForm({ ...EMPTY_FORM, date: prefillDate || todayISO() });
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.jobTitle.trim() || !form.company.trim() || !form.date || !form.time) {
      setError('Please fill in the role, company, date and time.');
      return;
    }
    const entry = scheduleInterview(form);
    addNotification({
      type: 'interview',
      title: 'Interview scheduled',
      message: `${entry.jobTitle} at ${entry.company} on ${formatDateLabel(entry.date)} at ${formatTimeLabel(entry.time)}.`,
      link: '/dashboard/schedule',
    });
    setModalOpen(false);
  };

  const daysWithInterviews = useMemo(() => {
    const map = {};
    upcoming.concat(past).forEach((i) => {
      map[i.date] = map[i.date] || [];
      map[i.date].push(i);
    });
    return map;
  }, [upcoming, past]);

  return (
    <DashboardShell title="Scheduler">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900">Interview Scheduler</h1>
          <p className="mt-0.5 text-sm text-ink-500">Keep every upcoming interview and recruiter call organized.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-xl border border-ink-100 bg-white p-1">
            {['list', 'calendar'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold capitalize transition-colors ${
                  view === v ? 'bg-brand-600 text-white' : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <Button onClick={() => openModal()}>
            <Plus size={16} /> Schedule interview
          </Button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 font-display text-sm font-bold text-ink-900">
              Upcoming ({upcoming.length})
            </h2>
            {upcoming.length === 0 ? (
              <EmptyState onSchedule={() => openModal()} />
            ) : (
              <div className="space-y-3">
                {upcoming.map((i) => (
                  <InterviewCard
                    key={i.id}
                    interview={i}
                    onComplete={() => completeInterview(i.id)}
                    onCancel={() => cancelInterview(i.id)}
                    onDelete={() => deleteInterview(i.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 font-display text-sm font-bold text-ink-900">History ({past.length})</h2>
            {past.length === 0 ? (
              <div className="rounded-xl2 border border-dashed border-ink-200 bg-white p-8 text-center text-sm text-ink-500">
                Past and completed interviews will show up here.
              </div>
            ) : (
              <div className="space-y-3">
                {past
                  .slice()
                  .reverse()
                  .map((i) => (
                    <InterviewCard key={i.id} interview={i} onDelete={() => deleteInterview(i.id)} past />
                  ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <CalendarView
          monthCursor={monthCursor}
          onMonthChange={setMonthCursor}
          daysWithInterviews={daysWithInterviews}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onScheduleForDay={(dateStr) => openModal(dateStr)}
        />
      )}

      <Modal open={modalOpen} onClose={closeModal} labelledBy="schedule-modal-title" className="max-w-md">
        <h2 id="schedule-modal-title" className="font-display text-lg font-bold text-ink-900">
          Schedule an interview
        </h2>
        <form onSubmit={submit} className="mt-4 space-y-3.5">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
          <Input label="Role / position" placeholder="e.g. Frontend Engineer" value={form.jobTitle} onChange={setField('jobTitle')} />
          <Input label="Company" placeholder="e.g. Acme Inc." value={form.company} onChange={setField('company')} />
          <div className="grid grid-cols-2 gap-3">
            <Input type="date" label="Date" value={form.date} onChange={setField('date')} />
            <Input type="time" label="Time" value={form.time} onChange={setField('time')} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Interview type</label>
            <div className="flex gap-2">
              {INTERVIEW_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                    form.type === t.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-ink-200 text-ink-500 hover:bg-ink-50'
                  }`}
                >
                  <t.icon size={15} /> {t.value}
                </button>
              ))}
            </div>
          </div>
          <Input
            label={form.type === 'Onsite' ? 'Address' : 'Meeting link'}
            placeholder={form.type === 'Onsite' ? '123 Main St, Suite 400' : 'https://zoom.us/j/...'}
            value={form.location}
            onChange={setField('location')}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={setField('notes')}
              rows={3}
              placeholder="Interviewer name, topics to prepare, etc."
              className="w-full rounded-xl border border-ink-200 bg-white p-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-400"
            />
          </div>
          <Button type="submit" fullWidth>
            <CalendarIcon size={16} /> Schedule interview
          </Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}

function EmptyState({ onSchedule }) {
  return (
    <div className="rounded-xl2 border border-dashed border-ink-200 bg-white p-8 text-center">
      <CalendarIcon className="mx-auto text-ink-300" size={26} />
      <p className="mt-2 text-sm font-semibold text-ink-800">No upcoming interviews</p>
      <p className="mt-1 text-xs text-ink-500">Schedule one to keep everything in one place.</p>
      <Button variant="secondary" className="mt-4" onClick={onSchedule}>
        <Plus size={15} /> Schedule interview
      </Button>
    </div>
  );
}

const TYPE_ICON_MAP = {
  'Phone call': Phone,
  'Video call': Video,
  Onsite: Building2,
};

function InterviewCard({ interview, onComplete, onCancel, onDelete, past }) {
  const Icon = TYPE_ICON_MAP[interview.type] || Video;
  const isCancelled = interview.status === 'cancelled';
  const isCompleted = interview.status === 'completed';

  return (
    <div className={`rounded-xl2 border bg-white p-4 shadow-soft ${isCancelled ? 'border-ink-100 opacity-60' : 'border-ink-100'}`}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Icon size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-ink-900">{interview.jobTitle}</p>
            {isCompleted && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-700">
                Completed
              </span>
            )}
            {isCancelled && (
              <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[0.65rem] font-bold text-ink-500">Cancelled</span>
            )}
          </div>
          <p className="truncate text-xs text-ink-500">{interview.company}</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-500">
            <span className="flex items-center gap-1">
              <CalendarIcon size={12} /> {formatDateLabel(interview.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {formatTimeLabel(interview.time)}
            </span>
            {interview.location && (
              <span className="flex max-w-[12rem] items-center gap-1 truncate">
                <MapPin size={12} /> {interview.location}
              </span>
            )}
          </div>
          {interview.notes && <p className="mt-2 rounded-lg bg-ink-50 px-2.5 py-1.5 text-xs text-ink-600">{interview.notes}</p>}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 border-t border-ink-100 pt-3">
        {!past && !isCancelled && (
          <>
            <Button variant="ghost" className="!h-8 px-2.5 text-xs" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="secondary" className="!h-8 px-2.5 text-xs" onClick={onComplete}>
              <CheckCircle2 size={13} /> Mark completed
            </Button>
          </>
        )}
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete interview"
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-300 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function CalendarView({ monthCursor, onMonthChange, daysWithInterviews, selectedDay, onSelectDay, onScheduleForDay }) {
  const { year, month } = monthCursor;
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayISO();

  const cells = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

  const monthLabel = firstOfMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const changeMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    onMonthChange({ year: y, month: m });
    onSelectDay(null);
  };

  const dateStrFor = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const selectedInterviews = selectedDay ? daysWithInterviews[selectedDay] || [] : [];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_20rem]">
      <div className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-ink-900">{monthLabel}</h2>
          <div className="flex gap-1">
            <button type="button" onClick={() => changeMonth(-1)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100">
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={() => changeMonth(1)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[0.7rem] font-semibold text-ink-400">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1.5">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, idx) => {
            if (d === null) return <div key={`empty-${idx}`} />;
            const dateStr = dateStrFor(d);
            const dayInterviews = daysWithInterviews[dateStr] || [];
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDay;
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onSelectDay(dateStr)}
                className={`relative flex h-14 flex-col items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-brand-600 text-white'
                    : isToday
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-700 hover:bg-ink-50'
                }`}
              >
                {d}
                {dayInterviews.length > 0 && (
                  <span
                    className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-brand-600'}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft">
        {!selectedDay ? (
          <p className="text-sm text-ink-500">Select a day to see or schedule interviews.</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-ink-900">{formatDateLabel(selectedDay)}</h3>
              <button type="button" onClick={() => onSelectDay(null)} aria-label="Close" className="text-ink-400 hover:text-ink-700">
                <X size={16} />
              </button>
            </div>
            <div className="mt-3 space-y-2.5">
              {selectedInterviews.length === 0 ? (
                <p className="text-xs text-ink-500">No interviews scheduled this day.</p>
              ) : (
                selectedInterviews.map((i) => (
                  <div key={i.id} className="rounded-lg bg-ink-50 p-2.5 text-xs">
                    <p className="font-semibold text-ink-900">{i.jobTitle}</p>
                    <p className="text-ink-500">
                      {i.company} - {formatTimeLabel(i.time)}
                    </p>
                  </div>
                ))
              )}
            </div>
            <Button variant="secondary" fullWidth className="mt-4" onClick={() => onScheduleForDay(selectedDay)}>
              <Plus size={15} /> Schedule for this day
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
