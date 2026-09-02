const request = require('supertest');
const app = require('../app');
const Job = require('../models/Job');

const validUser = {
  name: 'Analytics User',
  email: 'analytics@example.com',
  password: 'Passw0rd!',
};

const registerAndGetToken = async () => {
  const res = await request(app).post('/api/auth/register').send(validUser);
  return { token: res.body.data.token, userId: res.body.data.user._id };
};

// `postedBy` is set to the applicant themselves purely so this user is also
// allowed (as the job "owner") to update the application status below -
// unrelated to what's actually being tested here (dashboard aggregation).
const createJob = async (title, postedBy) =>
  Job.create({
    title,
    company: 'Acme Corp',
    location: 'Remote',
    description: 'Great role.',
    postedBy,
  });

describe('Analytics: Dashboard', () => {
  it('rejects unauthenticated access', async () => {
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(401);
  });

  it('returns zeroed metrics for a fresh account', async () => {
    const { token } = await registerAndGetToken();
    const res = await request(app).get('/api/analytics/dashboard').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.metrics.totalApplications).toBe(0);
    expect(res.body.data.metrics.successRate).toBe(0);
  });

  it('aggregates application status counts and success rate', async () => {
    const { token, userId } = await registerAndGetToken();
    const jobOne = await createJob('Job One', userId);
    const jobTwo = await createJob('Job Two', userId);

    const applyOne = await request(app)
      .post(`/api/applications/${jobOne._id}`)
      .set('Authorization', `Bearer ${token}`);
    const applyTwo = await request(app)
      .post(`/api/applications/${jobTwo._id}`)
      .set('Authorization', `Bearer ${token}`);

    await request(app)
      .patch(`/api/applications/${applyOne.body.data.application._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'offer' });
    await request(app)
      .patch(`/api/applications/${applyTwo.body.data.application._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'rejected' });

    const res = await request(app).get('/api/analytics/dashboard').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.metrics.totalApplications).toBe(2);
    expect(res.body.data.metrics.offers).toBe(1);
    expect(res.body.data.metrics.rejections).toBe(1);
    expect(res.body.data.metrics.successRate).toBe(50);
  });
});
