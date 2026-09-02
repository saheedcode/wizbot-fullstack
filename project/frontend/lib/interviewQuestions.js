/**
 * Local, categorized interview question bank powering the Interview Prep
 * tool. Everything runs client-side - no backend endpoint required - so
 * practice sessions work immediately and offline.
 */
export const INTERVIEW_CATEGORIES = [
  {
    key: 'behavioral',
    label: 'Behavioral',
    description: 'Classic "tell me about a time" questions every interview includes.',
    questions: [
      {
        q: 'Tell me about yourself.',
        tip: 'Give a 60-90 second walkthrough: current role, one or two relevant achievements, and why you\'re excited about this opportunity. Keep it relevant to the job.',
      },
      {
        q: 'Describe a time you faced a conflict with a coworker. How did you handle it?',
        tip: 'Use the STAR method (Situation, Task, Action, Result). Focus on how you listened, stayed professional, and reached a resolution.',
      },
      {
        q: 'Tell me about a time you failed. What did you learn?',
        tip: 'Pick a real, moderate failure, own it honestly, and spend most of the answer on what you changed afterward.',
      },
      {
        q: 'Describe a situation where you had to meet a tight deadline.',
        tip: 'Explain how you prioritized, what you communicated to stakeholders, and the outcome.',
      },
      {
        q: 'Tell me about a time you showed leadership without having formal authority.',
        tip: 'Highlight influence, initiative, and how you got buy-in from others.',
      },
      {
        q: 'How do you handle receiving critical feedback?',
        tip: 'Show that you can separate ego from growth - give a concrete example of feedback you acted on.',
      },
    ],
  },
  {
    key: 'software-engineer',
    label: 'Software Engineer',
    description: 'Technical and problem-solving questions for engineering roles.',
    questions: [
      {
        q: 'Walk me through how you would design a URL shortener.',
        tip: 'Cover the API shape, the encoding/hashing scheme, storage, and how you\'d handle scale (caching, sharding).',
      },
      {
        q: 'What\'s the difference between processes and threads?',
        tip: 'Mention memory isolation, context-switch cost, and when you\'d choose one over the other.',
      },
      {
        q: 'How would you debug a production API that suddenly got slower?',
        tip: 'Talk through metrics/logs first, then narrowing with tracing, recent deploys, DB query plans, and load.',
      },
      {
        q: 'Explain the trade-offs between SQL and NoSQL databases.',
        tip: 'Cover consistency, schema flexibility, scaling model, and give an example of when you\'d pick each.',
      },
      {
        q: 'How do you approach code review feedback you disagree with?',
        tip: 'Show you can discuss trade-offs with data/reasoning while staying collaborative.',
      },
      {
        q: 'Describe your approach to writing tests for a new feature.',
        tip: 'Mention unit vs integration tests, edge cases, and how tests fit into your development flow.',
      },
    ],
  },
  {
    key: 'product-manager',
    label: 'Product Manager',
    description: 'Prioritization, strategy, and stakeholder questions for PM roles.',
    questions: [
      {
        q: 'How do you prioritize a backlog with competing stakeholder demands?',
        tip: 'Reference a framework (RICE, impact/effort) and describe how you communicate trade-offs.',
      },
      {
        q: 'Tell me about a product you shipped that failed. What did you learn?',
        tip: 'Be candid about the miss, the root cause, and the process change you made afterward.',
      },
      {
        q: 'How would you measure the success of a new feature?',
        tip: 'Define a north-star metric plus 1-2 guardrail metrics, and mention how you\'d instrument tracking.',
      },
      {
        q: 'Walk me through how you would improve our onboarding flow.',
        tip: 'Show a structured approach: identify drop-off points with data, form hypotheses, propose an experiment.',
      },
      {
        q: 'How do you handle disagreements with engineering on scope or timelines?',
        tip: 'Emphasize collaboration, understanding constraints, and finding the smallest valuable scope together.',
      },
    ],
  },
  {
    key: 'data-analyst',
    label: 'Data Analyst / Scientist',
    description: 'Analytical thinking and statistics questions for data roles.',
    questions: [
      {
        q: 'How would you explain a p-value to a non-technical stakeholder?',
        tip: 'Use a plain-language analogy and avoid jargon; emphasize what it does and does not tell you.',
      },
      {
        q: 'Walk me through how you would investigate a sudden drop in a key metric.',
        tip: 'Segment the data, check for instrumentation issues, and rule out seasonality before external causes.',
      },
      {
        q: 'Describe a time your analysis changed a business decision.',
        tip: 'Focus on the insight, how you communicated it clearly, and the measurable outcome.',
      },
      {
        q: 'How do you decide which chart or visualization to use for a dataset?',
        tip: 'Tie the choice to the audience and the question being answered, not just the data shape.',
      },
    ],
  },
  {
    key: 'sales-marketing',
    label: 'Sales & Marketing',
    description: 'Persuasion, pipeline, and campaign questions for go-to-market roles.',
    questions: [
      {
        q: 'Sell me this pen (or any everyday object).',
        tip: 'Ask a clarifying question about the buyer\'s needs first, then tie features to a real benefit for them.',
      },
      {
        q: 'How do you handle a prospect who says your product is too expensive?',
        tip: 'Reframe around value/ROI rather than dropping price immediately; ask what "expensive" is being compared to.',
      },
      {
        q: 'Tell me about a campaign you ran that underperformed. What did you change?',
        tip: 'Be specific about the metric that missed, your hypothesis for why, and the adjustment you made.',
      },
      {
        q: 'How do you qualify a lead?',
        tip: 'Reference a framework like BANT/MEDDIC and how you tailor it to the funnel stage.',
      },
    ],
  },
  {
    key: 'customer-support',
    label: 'Customer Support',
    description: 'Empathy and problem-resolution questions for support/CS roles.',
    questions: [
      {
        q: 'Tell me about a time you dealt with an angry customer.',
        tip: 'Show active listening, empathy, and how you moved from de-escalation to resolution.',
      },
      {
        q: 'How do you prioritize tickets when you have a full queue?',
        tip: 'Mention severity/impact triage and clear communication with customers about wait times.',
      },
      {
        q: 'Describe a time you had to say no to a customer request.',
        tip: 'Focus on how you explained the reasoning and offered an alternative where possible.',
      },
    ],
  },
];

export function getCategory(key) {
  return INTERVIEW_CATEGORIES.find((c) => c.key === key) || null;
}

/** Deterministic-ish shuffle so a "new set" of questions still feels varied. */
export function pickQuestions(category, count = 5) {
  const pool = [...(category?.questions || [])];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}
