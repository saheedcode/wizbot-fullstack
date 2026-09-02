const request = require('supertest');
const app = require('../app');
const Job = require('../models/Job');
const User = require('../models/User');

const validUser = {
  name: 'Applicant One',
  email: 'applicant@example.com',
  password: 'Passw0rd!',
};

const registerAndGetToken = async (overrides = {}) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ ...validUser, ...overrides });
  return { token: res.body.data.token, userId: res.body.data.user._id };
};

const registerRecruiter = async (overrides = {}) => {
  return registerAndGetToken({
    name: 'Recruiter One',
    email: 'recruiter@example.com',
    role: 'recruiter',
    ...overrides,
  });
};

const createJob = async (postedBy) =>
  Job.create({
    title: 'Full Stack Engineer',
    company: 'Acme Corp',
    location: 'Remote',
    description: 'Build the whole stack.',
    skills: ['Node.js', 'React'],
    postedBy,
  });

describe('Applications', () => {
  it('rejects applying without auth', async () => {
    const { userId: recruiterId } = await registerRecruiter();
    const job = await createJob(recruiterId);
    const res = await request(app).post(`/api/applications/${job._id}`);
    expect(res.status).toBe(401);
  });

  it('applies to a job successfully', async () => {
    const { userId: recruiterId } = await registerRecruiter();
    const { token } = await registerAndGetToken();
    const job = await createJob(recruiterId);

    const res = await request(app)
      .post(`/api/applications/${job._id}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', Buffer.from('fake-resume-bytes'), {
        filename: 'resume.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.application.job.toString()).toBe(job._id.toString());
    expect(res.body.data.application.resumeUrl).toContain('cloudinary.com');
  });

  it('prevents duplicate applications to the same job', async () => {
    const { userId: recruiterId } = await registerRecruiter();
    const { token } = await registerAndGetToken();
    const job = await createJob(recruiterId);

    await request(app).post(`/api/applications/${job._id}`).set('Authorization', `Bearer ${token}`);
    const res = await request(app).post(`/api/applications/${job._id}`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('ALREADY_APPLIED');
  });

  it('returns 404 when applying to a non-existent job', async () => {
    const { token } = await registerAndGetToken();
    const res = await request(app)
      .post('/api/applications/64b6f6f6f6f6f6f6f6f6f6f6')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('JOB_NOT_FOUND');
  });

  it("lists the logged-in user's applications", async () => {
    const { userId: recruiterId } = await registerRecruiter();
    const { token } = await registerAndGetToken();
    const job = await createJob(recruiterId);
    await request(app).post(`/api/applications/${job._id}`).set('Authorization', `Bearer ${token}`);

    const res = await request(app).get('/api/applications/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.applications).toHaveLength(1);
    expect(res.body.data.applications[0].job.title).toBe('Full Stack Engineer');
  });

  it('lets the owning recruiter list all applications for their job', async () => {
    const { token: recruiterToken, userId: recruiterId } = await registerRecruiter();
    const { token: applicantToken } = await registerAndGetToken();
    const job = await createJob(recruiterId);
    await request(app).post(`/api/applications/${job._id}`).set('Authorization', `Bearer ${applicantToken}`);

    const res = await request(app)
      .get(`/api/applications/job/${job._id}`)
      .set('Authorization', `Bearer ${recruiterToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.applications).toHaveLength(1);
  });

  it('lets the owning recruiter update an application status', async () => {
    const { token: recruiterToken, userId: recruiterId } = await registerRecruiter();
    const { token: applicantToken } = await registerAndGetToken();
    const job = await createJob(recruiterId);
    const applyRes = await request(app)
      .post(`/api/applications/${job._id}`)
      .set('Authorization', `Bearer ${applicantToken}`);
    const applicationId = applyRes.body.data.application._id;

    const res = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({ status: 'interview' });

    expect(res.status).toBe(200);
    expect(res.body.data.application.status).toBe('interview');
  });

  it('rejects an invalid status value', async () => {
    const { token: recruiterToken, userId: recruiterId } = await registerRecruiter();
    const { token: applicantToken } = await registerAndGetToken();
    const job = await createJob(recruiterId);
    const applyRes = await request(app)
      .post(`/api/applications/${job._id}`)
      .set('Authorization', `Bearer ${applicantToken}`);
    const applicationId = applyRes.body.data.application._id;

    const res = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({ status: 'not-a-real-status' });

    expect(res.status).toBe(422);
  });

  describe('Ownership restrictions', () => {
    it('prevents a recruiter from viewing another recruiter\'s job applications', async () => {
      const { userId: ownerId } = await registerRecruiter();
      const { token: otherRecruiterToken } = await registerRecruiter({
        name: 'Recruiter Two',
        email: 'recruiter2@example.com',
      });
      const { token: applicantToken } = await registerAndGetToken();
      const job = await createJob(ownerId);
      await request(app).post(`/api/applications/${job._id}`).set('Authorization', `Bearer ${applicantToken}`);

      const res = await request(app)
        .get(`/api/applications/job/${job._id}`)
        .set('Authorization', `Bearer ${otherRecruiterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    it('prevents a recruiter from updating another recruiter\'s application', async () => {
      const { userId: ownerId } = await registerRecruiter();
      const { token: otherRecruiterToken } = await registerRecruiter({
        name: 'Recruiter Two',
        email: 'recruiter2@example.com',
      });
      const { token: applicantToken } = await registerAndGetToken();
      const job = await createJob(ownerId);
      const applyRes = await request(app)
        .post(`/api/applications/${job._id}`)
        .set('Authorization', `Bearer ${applicantToken}`);
      const applicationId = applyRes.body.data.application._id;

      const res = await request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${otherRecruiterToken}`)
        .send({ status: 'interview' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    it("lets an admin manage any recruiter's job applications", async () => {
      const { userId: ownerId } = await registerRecruiter();
      const { token: applicantToken } = await registerAndGetToken();
      const job = await createJob(ownerId);
      const applyRes = await request(app)
        .post(`/api/applications/${job._id}`)
        .set('Authorization', `Bearer ${applicantToken}`);
      const applicationId = applyRes.body.data.application._id;

      const adminRegisterRes = await request(app).post('/api/auth/register').send({
        name: 'Admin One',
        email: 'admin@example.com',
        password: 'Passw0rd!',
      });
      await User.findByIdAndUpdate(adminRegisterRes.body.data.user._id, { role: 'admin' });
      const adminToken = adminRegisterRes.body.data.token;

      const listRes = await request(app)
        .get(`/api/applications/job/${job._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(listRes.status).toBe(200);

      const updateRes = await request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'offer' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.application.status).toBe('offer');
    });
  });
});
