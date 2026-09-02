const request = require('supertest');
const app = require('../app');
const Job = require('../models/Job');
const Application = require('../models/Application');

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

const sampleBotPayload = (overrides = {}) => ({
  name: 'Software Engineering',
  config: {
    jobTitle: 'Software Engineer',
    jobType: 'Full-time',
    workMode: 'Remote',
    minSalary: 60000,
    maxSalary: 120000,
    excludedCompanies: ['Company X'],
  },
  ...overrides,
});

describe('Bots: CRUD', () => {
  it('creates a bot for the logged-in user', async () => {
    const { token } = await registerJobseeker();

    const res = await request(app)
      .post('/api/bots')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleBotPayload());

    expect(res.status).toBe(201);
    expect(res.body.data.bot.name).toBe('Software Engineering');
    expect(res.body.data.bot.status).toBe('active');
    expect(res.body.data.bot.stats.applied).toBe(0);
  });

  it('rejects bot creation without a job title in config', async () => {
    const { token } = await registerJobseeker();

    const res = await request(app)
      .post('/api/bots')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bad Bot', config: {} });

    expect(res.status).toBe(422);
  });

  it('lists only the logged-in user\'s bots', async () => {
    const { token } = await registerJobseeker();
    const { token: otherToken } = await registerJobseeker({ email: 'other@example.com' });

    await request(app).post('/api/bots').set('Authorization', `Bearer ${token}`).send(sampleBotPayload());
    await request(app)
      .post('/api/bots')
      .set('Authorization', `Bearer ${otherToken}`)
      .send(sampleBotPayload({ name: 'Other Bot' }));

    const res = await request(app).get('/api/bots').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.bots).toHaveLength(1);
    expect(res.body.data.bots[0].name).toBe('Software Engineering');
  });

  it('pauses and resumes a bot', async () => {
    const { token } = await registerJobseeker();
    const createRes = await request(app)
      .post('/api/bots')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleBotPayload());
    const botId = createRes.body.data.bot._id;

    const pauseRes = await request(app).patch(`/api/bots/${botId}/pause`).set('Authorization', `Bearer ${token}`);
    expect(pauseRes.body.data.bot.status).toBe('paused');

    const resumeRes = await request(app).patch(`/api/bots/${botId}/resume`).set('Authorization', `Bearer ${token}`);
    expect(resumeRes.body.data.bot.status).toBe('active');
  });

  it('updates bot config via edit', async () => {
    const { token } = await registerJobseeker();
    const createRes = await request(app)
      .post('/api/bots')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleBotPayload());
    const botId = createRes.body.data.bot._id;

    const res = await request(app)
      .patch(`/api/bots/${botId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Renamed Bot', config: { jobTitle: 'Senior Software Engineer' } });

    expect(res.status).toBe(200);
    expect(res.body.data.bot.name).toBe('Renamed Bot');
    expect(res.body.data.bot.config.jobTitle).toBe('Senior Software Engineer');
    // Untouched config fields are preserved.
    expect(res.body.data.bot.config.workMode).toBe('Remote');
  });

  it("prevents a user from accessing another user's bot", async () => {
    const { token } = await registerJobseeker();
    const { token: otherToken } = await registerJobseeker({ email: 'other@example.com' });

    const createRes = await request(app)
      .post('/api/bots')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleBotPayload());
    const botId = createRes.body.data.bot._id;

    const res = await request(app).get(`/api/bots/${botId}`).set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(404);
  });

  it('deletes a bot', async () => {
    const { token } = await registerJobseeker();
    const createRes = await request(app)
      .post('/api/bots')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleBotPayload());
    const botId = createRes.body.data.bot._id;

    const delRes = await request(app).delete(`/api/bots/${botId}`).set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(200);

    const getRes = await request(app).get(`/api/bots/${botId}`).set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(404);
  });
});

describe('Bots: Activity log and conversion funnel', () => {
  it('records activity, increments counters, and reflects real application outcomes in the funnel', async () => {
    const { token, userId } = await registerJobseeker();

    const job = await Job.create({
      title: 'Backend Engineer',
      company: 'Spotify',
      location: 'Remote',
      description: 'Build backend systems.',
      postedBy: userId,
    });

    const createRes = await request(app)
      .post('/api/bots')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleBotPayload());
    const botId = createRes.body.data.bot._id;

    await request(app)
      .post(`/api/bots/${botId}/activity`)
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'scanned', jobTitle: job.title, company: job.company });

    const applyRes = await request(app)
      .post(`/api/bots/${botId}/activity`)
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'applied', jobTitle: job.title, company: job.company, jobId: job._id.toString() });

    expect(applyRes.body.data.bot.stats.jobsScanned).toBe(1);
    expect(applyRes.body.data.bot.stats.applied).toBe(1);
    expect(applyRes.body.data.bot.activityLog).toHaveLength(2);

    const application = await Application.findOne({ bot: botId });
    expect(application).not.toBeNull();

    await request(app)
      .patch(`/api/applications/${application._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'offer' });

    const detailRes = await request(app).get(`/api/bots/${botId}`).set('Authorization', `Bearer ${token}`);

    expect(detailRes.body.data.conversionFunnel.offer).toBe(1);
    expect(detailRes.body.data.bot.stats.offersReceived).toBe(1);
  });
});
