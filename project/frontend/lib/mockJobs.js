// Frontend-only mock data for the Discover Jobs / Saved Jobs experience.
// This intentionally mirrors the shape the real backend returns
// (see backend/src/models/Job.js) so every component that already knows
// how to render a "job" keeps working unchanged - only the data source
// (mock array instead of an API call) is different.

const COMPANIES = [
  { name: 'Spotify', size: '5000+', color: '1DB954' },
  { name: 'TikTok', size: '5000+', color: '000000' },
  { name: 'LinkedIn', size: '5000+', color: '0A66C2' },
  { name: 'Google', size: '5000+', color: '4285F4' },
  { name: 'Airbnb', size: '1000-5000', color: 'FF5A5F' },
  { name: 'Stripe', size: '1000-5000', color: '635BFF' },
  { name: 'Canva', size: '1000-5000', color: '00C4CC' },
  { name: 'Notion', size: '200-1000', color: '000000' },
  { name: 'Figma', size: '200-1000', color: 'A259FF' },
  { name: 'Discord', size: '200-1000', color: '5865F2' },
  { name: 'Duolingo', size: '200-1000', color: '58CC02' },
  { name: 'Ramp', size: '200-1000', color: '1B1F23' },
  { name: 'Vercel', size: '50-200', color: '000000' },
  { name: 'Framer', size: '50-200', color: '0055FF' },
  { name: 'Linear', size: 'Less than 50', color: '5E6AD2' },
  { name: 'Superhuman', size: 'Less than 50', color: '000000' },
];

const LOCATIONS = [
  'Stockholm, Swedia',
  'China, Shanghai',
  'Jakarta, Indonesia',
  'Berlin, Germany',
  'London, UK',
  'Toronto, Canada',
  'Lagos, Nigeria',
  'Bangalore, India',
  'Austin, USA',
  'San Francisco, USA',
  'New York, USA',
  'Remote',
];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const WORK_MODES = ['Remote', 'Hybrid', 'Onsite'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Junior', 'Medium Level', 'Senior Level', 'Lead'];

// Role templates carry everything that should feel hand-written per title:
// the skills list, description and requirements. Combined with a company +
// location + a few rotated fields below, this produces a full, varied set
// of listings without every one reading like a mad-lib.
const ROLE_TEMPLATES = [
  {
    title: 'Product Designer',
    skills: ['Figma', 'Design Systems', 'Prototyping', 'User Research'],
    salary: [95000, 140000],
    description:
      "We're looking for a Product Designer to shape end-to-end experiences alongside product and engineering. You'll own flows from early concept through polished, shippable UI, and help grow our design system as the product scales.",
    requirements: [
      '4+ years designing digital products, with a strong portfolio of shipped work',
      'Fluent in Figma, including components, variants, and auto-layout',
      'Comfortable presenting and defending design decisions to cross-functional stakeholders',
      'Experience partnering closely with engineers through implementation',
    ],
  },
  {
    title: 'UX Researcher',
    skills: ['User Interviews', 'Usability Testing', 'Survey Design', 'Synthesis'],
    salary: [90000, 130000],
    description:
      'As UX Researcher you will plan and run qualitative and quantitative studies that shape our product roadmap, translating messy human behavior into clear, actionable recommendations for design and product teams.',
    requirements: [
      '3+ years in a dedicated UX research role',
      'Experience with both moderated and unmoderated usability testing',
      'Strong written and verbal communication - you can turn findings into a story',
      'Familiarity with survey tooling and basic statistical analysis',
    ],
  },
  {
    title: 'Frontend Engineer',
    skills: ['React', 'TypeScript', 'CSS', 'Accessibility'],
    salary: [110000, 160000],
    description:
      "You'll build fast, accessible interfaces used by millions of people, working closely with design to turn Figma files into production-quality React components with an eye for performance and polish.",
    requirements: [
      '3+ years building production web applications with React',
      'Strong grasp of modern CSS and responsive layout',
      'Experience writing accessible, semantic HTML',
      'Comfortable working in a component-driven, TypeScript codebase',
    ],
  },
  {
    title: 'Backend Engineer',
    skills: ['Node.js', 'PostgreSQL', 'System Design', 'REST APIs'],
    salary: [115000, 165000],
    description:
      "Join our platform team to design and operate the services that power core product features. You'll work across the stack from schema design to API contracts, with a strong focus on reliability at scale.",
    requirements: [
      '4+ years building backend services in a production environment',
      'Solid understanding of relational databases and query performance',
      'Experience designing and versioning REST or GraphQL APIs',
      'A track record of writing maintainable, well-tested code',
    ],
  },
  {
    title: 'Product Manager',
    skills: ['Roadmapping', 'Analytics', 'Stakeholder Management', 'A/B Testing'],
    salary: [120000, 175000],
    description:
      "You'll own a product area end to end - defining strategy, prioritizing the roadmap, and partnering with design and engineering to ship features that move real metrics.",
    requirements: [
      '4+ years of product management experience shipping consumer or B2B software',
      'Comfortable working with data to prioritize and measure impact',
      'Excellent written communication - specs, briefs, and stakeholder updates',
      'Experience running experiments and interpreting results',
    ],
  },
  {
    title: 'Data Analyst',
    skills: ['SQL', 'Python', 'Dashboards', 'Statistics'],
    salary: [85000, 120000],
    description:
      'As a Data Analyst you will partner with product and marketing teams to answer key business questions, build self-serve dashboards, and turn raw event data into decisions people actually trust.',
    requirements: [
      '2+ years in an analytics or data-focused role',
      'Advanced SQL and comfort with a scripting language such as Python',
      'Experience building dashboards in Looker, Tableau, or similar',
      'Strong intuition for statistics and experiment design',
    ],
  },
  {
    title: 'DevOps Engineer',
    skills: ['Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
    salary: [125000, 175000],
    description:
      "You'll own the infrastructure and deployment pipelines that keep our platform fast and reliable, working closely with engineering teams to make shipping software boring - in a good way.",
    requirements: [
      '4+ years in DevOps, SRE, or platform engineering',
      'Hands-on experience with Kubernetes and infrastructure-as-code',
      'Deep familiarity with a major cloud provider (AWS, GCP, or Azure)',
      'Experience building and maintaining CI/CD pipelines',
    ],
  },
  {
    title: 'Marketing Manager',
    skills: ['Campaign Strategy', 'SEO', 'Content', 'Analytics'],
    salary: [80000, 115000],
    description:
      "Lead go-to-market campaigns from concept to execution, working across content, performance, and lifecycle channels to grow awareness and drive qualified demand.",
    requirements: [
      '3+ years in a marketing role with campaign ownership',
      'Experience with SEO fundamentals and content strategy',
      'Comfortable reading campaign analytics and adjusting course quickly',
      'Strong collaborator across design, sales, and product',
    ],
  },
  {
    title: 'Customer Success Manager',
    skills: ['Onboarding', 'Account Management', 'Renewals', 'CRM'],
    salary: [70000, 100000],
    description:
      "You'll be the primary point of contact for a portfolio of accounts, guiding customers from onboarding through renewal and making sure they get real, measurable value from the product.",
    requirements: [
      '2+ years in customer success or account management',
      'Comfortable owning renewal and expansion conversations',
      'Experience with a CRM such as Salesforce or HubSpot',
      'Excellent written and verbal communication',
    ],
  },
  {
    title: 'QA Engineer',
    skills: ['Test Automation', 'Cypress', 'Manual Testing', 'CI/CD'],
    salary: [90000, 125000],
    description:
      "Own quality across the product by designing test plans, building automated coverage for critical flows, and partnering with engineers to catch regressions before customers ever see them.",
    requirements: [
      '3+ years in a QA or SDET role',
      'Experience building automated test suites (Cypress, Playwright, or similar)',
      'Comfortable reading code well enough to reason about edge cases',
      'A sharp eye for detail and an instinct for how things break',
    ],
  },
  {
    title: 'Technical Writer',
    skills: ['API Docs', 'Editing', 'Information Architecture', 'Markdown'],
    salary: [85000, 115000],
    description:
      "You'll write and maintain developer-facing documentation - guides, API references, and release notes - that make it easy for engineers to succeed with our product on the first try.",
    requirements: [
      '3+ years writing technical documentation for a developer audience',
      'Experience documenting REST or GraphQL APIs',
      'Comfortable working directly with engineers to verify accuracy',
      'A strong eye for structure, clarity, and consistency',
    ],
  },
  {
    title: 'Growth Marketer',
    skills: ['Experimentation', 'Paid Acquisition', 'Funnel Analysis', 'A/B Testing'],
    salary: [90000, 130000],
    description:
      'Run a rapid experimentation loop across acquisition, activation, and retention, using data to find the highest-leverage levers for sustainable growth.',
    requirements: [
      '3+ years in a growth or performance marketing role',
      'Experience designing and analyzing A/B tests',
      'Familiarity with paid acquisition channels and CAC/LTV math',
      'Comfortable working with SQL or analytics tooling directly',
    ],
  },
  {
    title: 'Full Stack Developer',
    skills: ['React', 'Node.js', 'PostgreSQL', 'REST APIs'],
    salary: [105000, 150000],
    description:
      "You'll ship features across the entire stack - from database schema to polished UI - working in a small, fast-moving team where ownership and impact go hand in hand.",
    requirements: [
      '3+ years building full-stack web applications',
      'Comfortable working across a React frontend and a Node.js backend',
      'Experience designing relational data models',
      'A pragmatic, ship-it mindset balanced with attention to quality',
    ],
  },
  {
    title: 'UI/UX Designer',
    skills: ['Figma', 'Interaction Design', 'Wireframing', 'Design Systems'],
    salary: [85000, 125000],
    description:
      "Design clean, intuitive interfaces for both web and mobile, working closely with a small product team where your design decisions ship within weeks, not quarters.",
    requirements: [
      '2+ years of product design experience',
      'A portfolio showing strong visual and interaction design craft',
      'Working knowledge of accessible design principles',
      'Comfortable iterating quickly from feedback',
    ],
  },
];

function seededRandom(seed) {
  // Small deterministic PRNG so the mock dataset is stable across renders
  // and reloads instead of reshuffling every time the module is imported.
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const rand = seededRandom(42);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

function buildJobs() {
  const jobs = [];
  let id = 1;

  COMPANIES.forEach((company, companyIdx) => {
    // Each company posts 2-3 roles so "Recommended for you" style grids and
    // the Company Detail view both have something real to show.
    const roleCount = 2 + Math.floor(rand() * 2);
    for (let i = 0; i < roleCount; i += 1) {
      const template = pick(ROLE_TEMPLATES);
      const [minBase, maxBase] = template.salary;
      const spread = Math.floor(rand() * 15000);
      const hoursAgo = 1 + Math.floor(rand() * 24 * 20); // up to ~20 days old

      jobs.push({
        _id: `job-${id}`,
        title: template.title,
        company: company.name,
        companyLogoUrl: null, // JobCard/JobDetailPanel already render a clean letter-avatar fallback
        companySize: company.size,
        location: pick(LOCATIONS),
        employmentType: pick(EMPLOYMENT_TYPES),
        workMode: pick(WORK_MODES),
        experienceLevel: pick(EXPERIENCE_LEVELS),
        salaryMin: minBase + spread,
        salaryMax: maxBase + spread,
        currency: 'USD',
        skills: template.skills,
        description: template.description,
        requirements: template.requirements,
        postedAt: new Date(Date.now() - hoursAgo * 3_600_000).toISOString(),
        postedBy: `recruiter-${companyIdx + 1}`,
      });
      id += 1;
    }
  });

  // Newest first, matching the default "sort: newest" experience.
  return jobs.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
}

export const MOCK_JOBS = buildJobs();

export function getJobById(id) {
  return MOCK_JOBS.find((j) => j._id === id) || null;
}

export function getJobsByCompany(company) {
  return MOCK_JOBS.filter((j) => j.company.toLowerCase() === (company || '').toLowerCase());
}

export const COMPANY_SIZES = ['Less than 50', '50-200', '200-1000', '1000-5000', '5000+'];
export { EMPLOYMENT_TYPES, WORK_MODES, EXPERIENCE_LEVELS };
