const request = require('supertest');
const app = require('../app');

const validUser = {
  name: 'Chat User',
  email: 'chatuser@example.com',
  password: 'Passw0rd!',
};

const registerAndGetToken = async () => {
  const res = await request(app).post('/api/auth/register').send(validUser);
  return res.body.data.token;
};

describe('Wizbot chat sessions', () => {
  it('rejects unauthenticated access', async () => {
    const res = await request(app).get('/api/chat/sessions');
    expect(res.status).toBe(401);
  });

  it('creates a new chat session', async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .post('/api/chat/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({ botName: 'Wizbot', title: 'Resume tips' });

    expect(res.status).toBe(201);
    expect(res.body.data.session.botName).toBe('Wizbot');
    expect(res.body.data.session.title).toBe('Resume tips');
    expect(res.body.data.session.messages).toEqual([]);
  });

  it('lists sessions with a lightweight preview', async () => {
    const token = await registerAndGetToken();
    const createRes = await request(app)
      .post('/api/chat/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    const sessionId = createRes.body.data.session._id;

    await request(app)
      .post(`/api/chat/sessions/${sessionId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ sender: 'user', text: 'How do I improve my resume?' });

    const res = await request(app).get('/api/chat/sessions').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.sessions).toHaveLength(1);
    expect(res.body.data.sessions[0].messageCount).toBe(1);
    expect(res.body.data.sessions[0].lastMessage.text).toBe('How do I improve my resume?');
  });

  it('appends messages to a session', async () => {
    const token = await registerAndGetToken();
    const createRes = await request(app)
      .post('/api/chat/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    const sessionId = createRes.body.data.session._id;

    const res = await request(app)
      .post(`/api/chat/sessions/${sessionId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ sender: 'bot', text: 'Sure, here are three quick wins...' });

    expect(res.status).toBe(201);
    expect(res.body.data.session.messages).toHaveLength(1);
    expect(res.body.data.session.messages[0].sender).toBe('bot');
  });

  it('returns 404 when adding a message to a non-existent session', async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .post('/api/chat/sessions/64b6f6f6f6f6f6f6f6f6f6f6/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({ sender: 'user', text: 'Hello?' });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('SESSION_NOT_FOUND');
  });

  it('deletes a session', async () => {
    const token = await registerAndGetToken();
    const createRes = await request(app)
      .post('/api/chat/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    const sessionId = createRes.body.data.session._id;

    const res = await request(app)
      .delete(`/api/chat/sessions/${sessionId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const listRes = await request(app).get('/api/chat/sessions').set('Authorization', `Bearer ${token}`);
    expect(listRes.body.data.sessions).toHaveLength(0);
  });
});
