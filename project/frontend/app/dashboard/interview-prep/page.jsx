'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  Lightbulb,
  ListChecks,
  Mic,
  RotateCcw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trophy,
} from 'lucide-react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import Button from '@/components/ui/Button';
import { useInterviewPrep } from '@/context/InterviewPrepContext';
import { useNotifications } from '@/context/NotificationsContext';
import { INTERVIEW_CATEGORIES, getCategory, pickQuestions } from '@/lib/interviewQuestions';

const SESSION_LENGTHS = [3, 5, 8];

export default function InterviewPrepPage() {
  const [tab, setTab] = useState('practice'); // practice | bank | progress
  const [stage, setStage] = useState('setup'); // setup | practicing | summary
  const [categoryKey, setCategoryKey] = useState(INTERVIEW_CATEGORIES[0].key);
  const [sessionLength, setSessionLength] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showTip, setShowTip] = useState(false);
  const [ratings, setRatings] = useState([]); // 'confident' | 'needs-work' per question

  const { recordSession, stats, sessions } = useInterviewPrep();
  const { addNotification } = useNotifications();

  const category = getCategory(categoryKey);
  const currentQuestion = questions[index];

  const startSession = () => {
    const picked = pickQuestions(category, sessionLength);
    setQuestions(picked);
    setIndex(0);
    setAnswer('');
    setShowTip(false);
    setRatings([]);
    setStage('practicing');
  };

  const rateAndAdvance = (rating) => {
    const nextRatings = [...ratings, rating];
    setRatings(nextRatings);

    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setAnswer('');
      setShowTip(false);
    } else {
      const confidentCount = nextRatings.filter((r) => r === 'confident').length;
      recordSession({
        categoryKey: category.key,
        categoryLabel: category.label,
        totalQuestions: questions.length,
        confidentCount,
      });
      addNotification({
        type: 'tip',
        title: 'Mock interview completed',
        message: `You practiced ${questions.length} ${category.label} questions - ${confidentCount} felt confident.`,
        link: '/dashboard/interview-prep',
      });
      setStage('summary');
    }
  };

  const restart = () => {
    setStage('setup');
    setQuestions([]);
    setIndex(0);
    setAnswer('');
    setRatings([]);
  };

  const confidentCount = ratings.filter((r) => r === 'confident').length;

  return (
    <DashboardShell title="Interview Prep">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900">Interview Prep</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            Practice real interview questions, get on-the-spot guidance, and track your progress.
          </p>
        </div>
        <div className="flex gap-1 rounded-xl border border-ink-100 bg-white p-1">
          {[
            { key: 'practice', label: 'Practice', icon: Mic },
            { key: 'bank', label: 'Question Bank', icon: ListChecks },
            { key: 'progress', label: 'Progress', icon: BarChart3 },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                if (t.key === 'practice' && stage === 'summary') restart();
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                tab === t.key ? 'bg-brand-600 text-white' : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'practice' && stage === 'setup' && (
        <SetupPanel
          categoryKey={categoryKey}
          onCategoryChange={setCategoryKey}
          sessionLength={sessionLength}
          onSessionLengthChange={setSessionLength}
          onStart={startSession}
        />
      )}

      {tab === 'practice' && stage === 'practicing' && currentQuestion && (
        <PracticePanel
          category={category}
          question={currentQuestion}
          index={index}
          total={questions.length}
          answer={answer}
          onAnswerChange={setAnswer}
          showTip={showTip}
          onToggleTip={() => setShowTip((v) => !v)}
          onRate={rateAndAdvance}
          onExit={restart}
        />
      )}

      {tab === 'practice' && stage === 'summary' && (
        <SummaryPanel
          category={category}
          total={questions.length}
          confidentCount={confidentCount}
          onRestart={restart}
          onPracticeAgain={startSession}
        />
      )}

      {tab === 'bank' && <QuestionBankPanel />}

      {tab === 'progress' && <ProgressPanel stats={stats} sessions={sessions} />}
    </DashboardShell>
  );
}

function SetupPanel({ categoryKey, onCategoryChange, sessionLength, onSessionLengthChange, onStart }) {
  const category = getCategory(categoryKey);
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
        <h2 className="font-display text-base font-bold text-ink-900">1. Choose a category</h2>
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {INTERVIEW_CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => onCategoryChange(c.key)}
              className={`rounded-xl border p-3.5 text-left transition-colors ${
                categoryKey === c.key
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-ink-100 bg-white hover:border-ink-200 hover:bg-ink-50'
              }`}
            >
              <p className={`text-sm font-semibold ${categoryKey === c.key ? 'text-brand-700' : 'text-ink-900'}`}>
                {c.label}
              </p>
              <p className="mt-0.5 text-xs text-ink-500">{c.description}</p>
              <p className="mt-1.5 text-[0.7rem] font-medium text-ink-400">{c.questions.length} questions available</p>
            </button>
          ))}
        </div>

        <h2 className="mt-6 font-display text-base font-bold text-ink-900">2. Session length</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {SESSION_LENGTHS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onSessionLengthChange(n)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                sessionLength === n
                  ? 'bg-brand-600 text-white'
                  : 'border border-ink-200 text-ink-600 hover:bg-ink-50'
              }`}
            >
              {n} questions
            </button>
          ))}
        </div>

        <Button className="mt-6" onClick={onStart}>
          <Sparkles size={16} /> Start mock interview
        </Button>
      </div>

      <div className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
        <h3 className="font-display text-sm font-bold text-ink-900">What you&rsquo;ll practice</h3>
        <p className="mt-1 text-sm text-ink-500">{category.description}</p>
        <ul className="mt-4 space-y-2.5">
          {category.questions.slice(0, 4).map((q) => (
            <li key={q.q} className="flex items-start gap-2 text-sm text-ink-700">
              <Check size={14} className="mt-1 shrink-0 text-brand-600" />
              <span>{q.q}</span>
            </li>
          ))}
          {category.questions.length > 4 && (
            <li className="pl-6 text-xs font-medium text-ink-400">
              +{category.questions.length - 4} more in this category
            </li>
          )}
        </ul>
        <div className="mt-5 rounded-xl bg-brand-50 p-3.5 text-xs text-brand-800">
          <p className="font-semibold">How it works</p>
          <p className="mt-1 text-brand-700">
            Answer each question in your own words, reveal a tip on what a strong answer covers, then rate how
            confident you felt. Your results are saved to the Progress tab.
          </p>
        </div>
      </div>
    </div>
  );
}

function PracticePanel({ category, question, index, total, answer, onAnswerChange, showTip, onToggleTip, onRate, onExit }) {
  const progressPct = Math.round(((index + 1) / total) * 100);
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={onExit} className="flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-ink-800">
          <ArrowLeft size={14} /> End session
        </button>
        <span className="text-xs font-semibold text-ink-500">
          Question {index + 1} of {total} - {category.label}
        </span>
      </div>

      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
            <Mic size={16} />
          </span>
          <h2 className="pt-1.5 font-display text-lg font-bold text-ink-900">{question.q}</h2>
        </div>

        <textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          rows={6}
          placeholder="Type your answer out loud as if you were speaking to the interviewer..."
          className="mt-4 w-full rounded-xl border border-ink-200 bg-white p-3.5 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-400"
        />

        <button
          type="button"
          onClick={onToggleTip}
          className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          <Lightbulb size={15} /> {showTip ? 'Hide' : 'Show'} what a strong answer covers
        </button>

        {showTip && (
          <div className="mt-2.5 rounded-xl border border-amber-100 bg-amber-50 p-3.5 text-sm text-amber-800">
            {question.tip}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2.5 border-t border-ink-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-ink-500">How confident do you feel about that answer?</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onRate('needs-work')}>
              <ThumbsDown size={15} /> Needs work
            </Button>
            <Button onClick={() => onRate('confident')}>
              <ThumbsUp size={15} /> Confident
              <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryPanel({ category, total, confidentCount, onRestart, onPracticeAgain }) {
  const pct = total > 0 ? Math.round((confidentCount / total) * 100) : 0;
  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-xl2 border border-ink-100 bg-white p-7 text-center shadow-soft">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <Trophy size={26} />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-ink-900">Session complete!</h2>
        <p className="mt-1.5 text-sm text-ink-500">
          You practiced {total} {category.label} question{total === 1 ? '' : 's'}.
        </p>

        <div className="mx-auto mt-6 grid max-w-xs grid-cols-2 gap-3">
          <div className="rounded-xl bg-ink-50 p-4">
            <p className="font-display text-2xl font-bold text-ink-900">{confidentCount}</p>
            <p className="text-xs text-ink-500">Felt confident</p>
          </div>
          <div className="rounded-xl bg-ink-50 p-4">
            <p className="font-display text-2xl font-bold text-ink-900">{pct}%</p>
            <p className="text-xs text-ink-500">Confidence score</p>
          </div>
        </div>

        <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Button variant="secondary" onClick={onRestart}>
            <ListChecks size={16} /> Choose new category
          </Button>
          <Button onClick={onPracticeAgain}>
            <RotateCcw size={16} /> Practice again
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuestionBankPanel() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {INTERVIEW_CATEGORIES.map((c) => (
        <div key={c.key} className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft">
          <h3 className="font-display text-sm font-bold text-ink-900">{c.label}</h3>
          <p className="mt-1 text-xs text-ink-500">{c.description}</p>
          <ul className="mt-3 space-y-2">
            {c.questions.map((q) => (
              <li key={q.q} className="rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-700">
                {q.q}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ProgressPanel({ stats, sessions }) {
  const topCategory = useMemo(() => {
    const entries = Object.entries(stats.byCategory || {});
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    const [key, count] = entries[0];
    return { label: getCategory(key)?.label || key, count };
  }, [stats]);

  if (stats.totalSessions === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-ink-200 bg-white p-10 text-center">
        <BarChart3 className="mx-auto text-ink-300" size={28} />
        <h3 className="mt-3 font-display text-base font-bold text-ink-900">No practice sessions yet</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">
          Complete a mock interview in the Practice tab and your progress will show up here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Sessions completed" value={stats.totalSessions} icon={BadgeCheck} />
        <StatCard label="Questions practiced" value={stats.totalQuestions} icon={ListChecks} />
        <StatCard
          label="Confidence score"
          value={stats.confidencePct !== null ? `${stats.confidencePct}%` : '-'}
          icon={ThumbsUp}
        />
        <StatCard label="Most practiced" value={topCategory?.label || '-'} icon={Trophy} small />
      </div>

      <div className="mt-5 rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft">
        <h3 className="font-display text-sm font-bold text-ink-900">Recent sessions</h3>
        <div className="mt-3 divide-y divide-ink-100">
          {sessions.slice(0, 10).map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">{s.categoryLabel}</p>
                <p className="text-xs text-ink-400">{new Date(s.completedAt).toLocaleString()}</p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {s.confidentCount}/{s.totalQuestions} confident
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, small }) {
  return (
    <div className="rounded-xl2 border border-ink-100 bg-white p-4 shadow-soft">
      <div className="flex items-center gap-2 text-ink-400">
        <Icon size={14} />
        <p className="text-[0.7rem] font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <p className={`mt-1.5 font-display font-bold text-ink-900 ${small ? 'text-sm' : 'text-2xl'}`}>{value}</p>
    </div>
  );
}
