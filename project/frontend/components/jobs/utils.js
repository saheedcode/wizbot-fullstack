export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const hours = Math.max(1, Math.round(diffMs / 3_600_000));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

export function formatSalary(job) {
  if (!job?.salaryMin && !job?.salaryMax) return null;
  const currency = job.currency || 'USD';
  const fmt = (n) =>
    new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 0 }).format(n);
  if (job.salaryMin && job.salaryMax) return `${currency} ${fmt(job.salaryMin)}–${fmt(job.salaryMax)}`;
  return `${currency} ${fmt(job.salaryMin || job.salaryMax)}`;
}

/**
 * Real, data-driven "match" score - the share of the job's listed skills that
 * also appear in the current user's profile.skills. Returns null (rather than
 * a fabricated number) whenever there isn't enough real data to compare, so
 * the UI can simply hide the match badge in that case.
 */
export function computeMatch(user, job) {
  const jobSkills = (job?.skills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
  const userSkills = (user?.profile?.skills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
  if (jobSkills.length === 0 || userSkills.length === 0) return null;
  const userSkillSet = new Set(userSkills);
  const overlap = jobSkills.filter((s) => userSkillSet.has(s)).length;
  return Math.round((overlap / jobSkills.length) * 100);
}

/** URL-safe slug for a company name, used to route to its company profile page. */
export function companySlug(name) {
  return encodeURIComponent((name || '').trim());
}

/**
 * A deterministic, royalty-free cover photo for a company's banner. There's
 * no "company cover image" field in the data model, so rather than leaving a
 * blank space (or inventing a fake CDN url that 404s) we derive a stable
 * picsum.photos seed from the company name - the same company always gets
 * the same photo, and it's a real image rather than a flat placeholder.
 */
export function companyBannerUrl(name, { width = 800, height = 260 } = {}) {
  const seed = encodeURIComponent((name || 'wizjobai').trim().toLowerCase());
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
export const WORK_MODES = ['Remote', 'Hybrid', 'Onsite'];
export const EXPERIENCE_LEVELS = ['Entry Level', 'Junior', 'Medium Level', 'Senior Level', 'Lead'];
export const COMPANY_SIZES = ['Less than 50', '50-200', '200-1000', '1000-5000', '5000+'];
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'salary_high', label: 'Salary: high to low' },
  { value: 'salary_low', label: 'Salary: low to high' },
];

/**
 * Client-side search/filter/sort over the mock job dataset - the frontend
 * equivalent of what backend/src/controllers/jobController.js#listJobs does
 * server-side. Every field here maps 1:1 to a control on the Discover Jobs
 * filter bar.
 */
export function filterJobs(jobs, filters = {}) {
  const { search, location, employmentType, workMode, experienceLevel, companySize, minSalary, sort } = filters;

  let result = jobs.filter((job) => {
    if (search) {
      const q = search.toLowerCase();
      const haystack = `${job.title} ${job.company} ${(job.skills || []).join(' ')}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (location && !job.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (employmentType && job.employmentType !== employmentType) return false;
    if (workMode && job.workMode !== workMode) return false;
    if (experienceLevel && job.experienceLevel !== experienceLevel) return false;
    if (companySize && job.companySize !== companySize) return false;
    if (minSalary) {
      const min = Number(minSalary);
      const jobMax = job.salaryMax ?? job.salaryMin ?? 0;
      if (!Number.isNaN(min) && jobMax < min) return false;
    }
    return true;
  });

  if (sort === 'salary_high') {
    result = [...result].sort((a, b) => (b.salaryMax ?? b.salaryMin ?? 0) - (a.salaryMax ?? a.salaryMin ?? 0));
  } else if (sort === 'salary_low') {
    result = [...result].sort((a, b) => (a.salaryMin ?? a.salaryMax ?? 0) - (b.salaryMin ?? b.salaryMax ?? 0));
  } else {
    result = [...result].sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  }

  return result;
}

export const REPORT_REASONS = [
  { value: 'not_accepting_applications', label: 'No longer accepting applications' },
  { value: 'spam', label: 'Spam' },
  { value: 'fraud_or_scam', label: 'Fraud or scam' },
  { value: 'misleading_description', label: 'Misleading description' },
  { value: 'other', label: 'Other' },
];
