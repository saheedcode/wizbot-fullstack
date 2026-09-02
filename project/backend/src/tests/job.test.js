const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Job = require('../models/Job');

const sampleJob = (overrides = {}) => ({
  title: 'Frontend Engineer',
  company: 'Acme Corp',
  location: 'Remote',
  employmentType: 'Full-time',
  workMode: 'Remote',
  description: 'Build delightful UIs.',
  skills: ['React', 'TypeScript'],
  postedBy: new mongoose.Types.ObjectId(),
  ...overrides,
});

const registerRecruiter = async (overrides = {}) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Recruiter One',
      email: 'recruiter@example.com',
      password: 'Passw0rd!',
      role: 'recruiter',
      ...overrides,
    });
  return { token: res.body.data.token, userId: res.body.data.user._id };
};

const registerJobseeker = async (overrides = {}) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Jobseeker One',
      email: 'jobseeker@example.com',
      password: 'Passw0rd!',
      ...overrides,
    });
  return { token: res.body.data.token, userId: res.body.data.user._id };
};

describe('Jobs: Listing', () => {
  beforeEach(async () => {
    await Job.create(sampleJob());
    await Job.create(sampleJob({ title: 'Backend Engineer', workMode: 'Onsite', skills: ['Node.js'] }));
  });

  it('lists jobs with pagination metadata', async () => {
    const res = await request(app).get('/api/jobs').query({ page: 1, limit: 1 });
    expect(res.status).toBe(200);
    expect(res.body.data.jobs).toHaveLength(1);
    expect(res.body.meta.total).toBe(2);
    expect(res.body.meta.totalPages).toBe(2);
  });

  it('filters jobs by workMode', async () => {
    const res = await request(app).get('/api/jobs').query({ workMode: 'Onsite' });
    expect(res.status).toBe(200);
    expect(res.body.data.jobs).toHaveLength(1);
    expect(res.body.data.jobs[0].title).toBe('Backend Engineer');
  });

  it('fetches a single job by id', async () => {
    const job = await Job.findOne({ title: 'Frontend Engineer' });
    const res = await request(app).get(`/api/jobs/${job._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.job.title).toBe('Frontend Engineer');
  });

  it('returns 404 for a non-existent job id', async () => {
    const res = await request(app).get('/api/jobs/64b6f6f6f6f6f6f6f6f6f6f6');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('JOB_NOT_FOUND');
  });
});

describe('Jobs: Recruiter CRUD & permissions', () => {
  const jobPayload = {
    title: 'Senior Backend Engineer',
    company: 'Acme Corp',
    location: 'Remote',
    employmentType: 'Full-time',
    workMode: 'Remote',
    description: 'Own the payments service end to end.',
    skills: ['Node.js', 'MongoDB'],
  };

  it('rejects job creation without auth', async () => {
    const res = await request(app).post('/api/jobs').send(jobPayload);
    expect(res.status).toBe(401);
  });

  it('allows a recruiter to create a job they own', async () => {
    const { token, userId } = await registerRecruiter();
    const res = await request(app).post('/api/jobs').set('Authorization', `Bearer ${token}`).send(jobPayload);

    expect(res.status).toBe(201);
    expect(res.body.data.job.title).toBe(jobPayload.title);
    expect(res.body.data.job.postedBy).toBe(userId);
  });

  it('rejects job creation from a jobseeker', async () => {
    const { token } = await registerJobseeker();
    const res = await request(app).post('/api/jobs').set('Authorization', `Bearer ${token}`).send(jobPayload);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('allows a recruiter to update their own job', async () => {
    const { token } = await registerRecruiter();
    const createRes = await request(app).post('/api/jobs').set('Authorization', `Bearer ${token}`).send(jobPayload);
    const jobId = createRes.body.data.job._id;

    const res = await request(app)
      .patch(`/api/jobs/${jobId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Staff Backend Engineer' });

    expect(res.status).toBe(200);
    expect(res.body.data.job.title).toBe('Staff Backend Engineer');
  });

  it('allows a recruiter to delete their own job', async () => {
    const { token } = await registerRecruiter();
    const createRes = await request(app).post('/api/jobs').set('Authorization', `Bearer ${token}`).send(jobPayload);
    const jobId = createRes.body.data.job._id;

    const res = await request(app).delete(`/api/jobs/${jobId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const getRes = await request(app).get(`/api/jobs/${jobId}`);
    expect(getRes.status).toBe(404);
  });

  it('prevents one recruiter from updating another recruiter\'s job', async () => {
    const owner = await registerRecruiter();
    const createRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(jobPayload);
    const jobId = createRes.body.data.job._id;

    const otherRecruiter = await registerRecruiter({
      name: 'Recruiter Two',
      email: 'recruiter2@example.com',
    });

    const res = await request(app)
      .patch(`/api/jobs/${jobId}`)
      .set('Authorization', `Bearer ${otherRecruiter.token}`)
      .send({ title: 'Hijacked Title' });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('allows an admin to update any recruiter\'s job', async () => {
    const owner = await registerRecruiter();
    const createRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(jobPayload);
    const jobId = createRes.body.data.job._id;

    // Admins can't self-register - promote a normal account directly via the model.
    const User = require('../models/User');
    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'Admin One',
      email: 'admin@example.com',
      password: 'Passw0rd!',
    });
    await User.findByIdAndUpdate(adminRes.body.data.user._id, { role: 'admin' });

    const res = await request(app)
      .patch(`/api/jobs/${jobId}`)
      .set('Authorization', `Bearer ${adminRes.body.data.token}`)
      .send({ title: 'Admin-Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body.data.job.title).toBe('Admin-Updated Title');
  });
});

describe('Auth: Role assignment on registration', () => {
  it('defaults to jobseeker when no role is provided', async () => {
    const { token } = await registerJobseeker();
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.body.data.user.role).toBe('jobseeker');
  });

  it('allows registering as a recruiter', async () => {
    const { token } = await registerRecruiter();
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.body.data.user.role).toBe('recruiter');
  });

  it('rejects self-registration as admin', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Sneaky Admin',
      email: 'sneaky@example.com',
      password: 'Passw0rd!',
      role: 'admin',
    });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('Jobs: Saved jobs', () => {
  let job;

  beforeEach(async () => {
    job = await Job.create(sampleJob());
  });

  it('saves a job for the logged-in user and lists it', async () => {
    const { token } = await registerJobseeker();

    const saveRes = await request(app).post(`/api/jobs/${job._id}/save`).set('Authorization', `Bearer ${token}`);
    expect(saveRes.status).toBe(200);

    const listRes = await request(app).get('/api/jobs/saved/me').set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.jobs).toHaveLength(1);
    expect(listRes.body.data.jobs[0]._id).toBe(job._id.toString());
  });

  it('is idempotent when saving the same job twice', async () => {
    const { token } = await registerJobseeker();

    await request(app).post(`/api/jobs/${job._id}/save`).set('Authorization', `Bearer ${token}`);
    const secondSave = await request(app).post(`/api/jobs/${job._id}/save`).set('Authorization', `Bearer ${token}`);
    expect(secondSave.status).toBe(200);

    const listRes = await request(app).get('/api/jobs/saved/me').set('Authorization', `Bearer ${token}`);
    expect(listRes.body.data.jobs).toHaveLength(1);
  });

  it('unsaves a job', async () => {
    const { token } = await registerJobseeker();

    await request(app).post(`/api/jobs/${job._id}/save`).set('Authorization', `Bearer ${token}`);
    const unsaveRes = await request(app).delete(`/api/jobs/${job._id}/save`).set('Authorization', `Bearer ${token}`);
    expect(unsaveRes.status).toBe(200);

    const listRes = await request(app).get('/api/jobs/saved/me').set('Authorization', `Bearer ${token}`);
    expect(listRes.body.data.jobs).toHaveLength(0);
  });

  it('requires authentication to save a job', async () => {
    const res = await request(app).post(`/api/jobs/${job._id}/save`);
    expect(res.status).toBe(401);
  });
});

describe('Jobs: Report a job', () => {
  let job;

  beforeEach(async () => {
    job = await Job.create(sampleJob());
  });

  it('submits a report with a valid reason', async () => {
    const { token } = await registerJobseeker();

    const res = await request(app)
      .post(`/api/jobs/${job._id}/report`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'fraud_or_scam', description: 'This posting looks fake.' });

    expect(res.status).toBe(201);
    expect(res.body.data.report.reason).toBe('fraud_or_scam');
    expect(res.body.data.report.status).toBe('pending');
  });

  it('rejects a report with an invalid reason', async () => {
    const { token } = await registerJobseeker();

    const res = await request(app)
      .post(`/api/jobs/${job._id}/report`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'not_a_real_reason' });

    expect(res.status).toBe(422);
  });

  it('404s when reporting a job that does not exist', async () => {
    const { token } = await registerJobseeker();
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post(`/api/jobs/${fakeId}/report`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'spam' });

    expect(res.status).toBe(404);
  });
});
