const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { hashValue } = require('../utils/token');

const validUser = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'Passw0rd!',
};

describe('Auth: Register', () => {
  it('registers a new user with valid data', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects weak passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'weak@example.com', password: 'weak' });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'not-an-email' });
    expect(res.status).toBe(422);
  });
});

describe('Auth: Login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validUser);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(validUser.email);
  });

  it('rejects incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPass1' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects login for non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nouser@example.com', password: 'Passw0rd!' });
    expect(res.status).toBe(401);
  });
});

describe('Auth: Protected routes / JWT', () => {
  it('rejects access without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('rejects access with an invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid.token.value');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_TOKEN');
  });

  it('allows access with a valid token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(validUser);
    const token = registerRes.body.data.token;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(validUser.email);
  });
});

describe('Auth: Forgot password / OTP flow', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validUser);
  });

  it('generates an OTP for an existing account', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: validUser.email });
    expect(res.status).toBe(200);
    expect(res.body.meta.devOtp).toHaveLength(6);

    const user = await User.findOne({ email: validUser.email }).select('+otpHash');
    expect(user?.otpHash).toBe(hashValue(res.body.meta.devOtp));
  });

  it('returns 404 for a non-existent account without leaking existence explicitly as success', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'ghost@example.com' });
    expect(res.status).toBe(404);
  });

  it('verifies a correct OTP and returns a reset token', async () => {
    const forgotRes = await request(app).post('/api/auth/forgot-password').send({ email: validUser.email });
    const otp = forgotRes.body.meta.devOtp;

    const verifyRes = await request(app).post('/api/auth/verify-reset-otp').send({ email: validUser.email, otp });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.resetToken).toBeDefined();
  });

  it('rejects an incorrect OTP and decrements attempts', async () => {
    await request(app).post('/api/auth/forgot-password').send({ email: validUser.email });

    const res = await request(app)
      .post('/api/auth/verify-reset-otp')
      .send({ email: validUser.email, otp: '000000' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('OTP_INCORRECT');
  });

  it('rejects an expired OTP', async () => {
    const forgotRes = await request(app).post('/api/auth/forgot-password').send({ email: validUser.email });
    const otp = forgotRes.body.meta.devOtp;

    // force-expire
    await User.findOneAndUpdate({ email: validUser.email }, { otpExpiresAt: new Date(Date.now() - 1000) });

    const res = await request(app).post('/api/auth/verify-reset-otp').send({ email: validUser.email, otp });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('OTP_EXPIRED');
  });

  it('locks out after exceeding max OTP attempts', async () => {
    await request(app).post('/api/auth/forgot-password').send({ email: validUser.email });

    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/auth/verify-reset-otp').send({ email: validUser.email, otp: '111111' });
    }

    const res = await request(app).post('/api/auth/verify-reset-otp').send({ email: validUser.email, otp: '111111' });
    expect(res.status).toBe(429);
    expect(res.body.code).toBe('OTP_MAX_ATTEMPTS');
  });

  it('resets the password with a valid reset token', async () => {
    const forgotRes = await request(app).post('/api/auth/forgot-password').send({ email: validUser.email });
    const otp = forgotRes.body.meta.devOtp;
    const verifyRes = await request(app).post('/api/auth/verify-reset-otp').send({ email: validUser.email, otp });
    const resetToken = verifyRes.body.data.resetToken;

    const newPassword = 'NewPassw0rd!';
    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: validUser.email, resetToken, password: newPassword });
    expect(resetRes.status).toBe(200);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: newPassword });
    expect(loginRes.status).toBe(200);
  });

  it('rejects reset with an invalid reset token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: validUser.email, resetToken: 'a'.repeat(64), password: 'NewPassw0rd!' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_RESET_TOKEN');
  });
});

describe('Auth: Update password', () => {
  it('updates password when current password is correct', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(validUser);
    const token = registerRes.body.data.token;

    const res = await request(app)
      .patch('/api/auth/update-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: validUser.password, newPassword: 'AnotherPass1!' });
    expect(res.status).toBe(200);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'AnotherPass1!' });
    expect(loginRes.status).toBe(200);
  });

  it('rejects update when current password is wrong', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(validUser);
    const token = registerRes.body.data.token;

    const res = await request(app)
      .patch('/api/auth/update-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'WrongOne1!', newPassword: 'AnotherPass1!' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CURRENT_PASSWORD');
  });
});
