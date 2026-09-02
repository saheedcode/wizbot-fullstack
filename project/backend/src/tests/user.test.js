const request = require('supertest');
const app = require('../app');

const validUser = {
  name: 'Jane Doe',
  email: 'jane.profile@example.com',
  password: 'Passw0rd!',
};

const registerAndGetToken = async () => {
  const res = await request(app).post('/api/auth/register').send(validUser);
  return res.body.data.token;
};

describe('User: Profile', () => {
  it('updates profile fields', async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Jane Updated',
        profile: { headline: 'Senior Product Designer', skills: ['Figma', 'UX Research'] },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe('Jane Updated');
    expect(res.body.data.user.profile.headline).toBe('Senior Product Designer');
    expect(res.body.data.user.profile.skills).toEqual(['Figma', 'UX Research']);
  });

  it('rejects profile update without auth', async () => {
    const res = await request(app).patch('/api/users/me').send({ name: 'No Auth' });
    expect(res.status).toBe(401);
  });

  it('uploads an avatar image (Cloudinary mocked)', async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .post('/api/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('avatar', Buffer.from('fake-image-bytes'), {
        filename: 'avatar.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.avatarUrl).toContain('cloudinary.com');
  });

  it('rejects avatar upload without a file', async () => {
    const token = await registerAndGetToken();
    const res = await request(app).post('/api/users/me/avatar').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('NO_FILE');
  });

  it('rejects unsupported file types', async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .post('/api/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('avatar', Buffer.from('not-an-image'), {
        filename: 'file.txt',
        contentType: 'text/plain',
      });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_FILE_TYPE');
  });

  it('deletes the avatar', async () => {
    const token = await registerAndGetToken();
    await request(app)
      .post('/api/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('avatar', Buffer.from('fake-image-bytes'), {
        filename: 'avatar.jpg',
        contentType: 'image/jpeg',
      });

    const res = await request(app).delete('/api/users/me/avatar').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.avatarUrl).toBe('');
  });
});
