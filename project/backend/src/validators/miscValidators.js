const { z } = require('zod');

const createSessionSchema = z.object({
  body: z.object({
    botName: z.string().trim().max(100).optional(),
    botAvatar: z.string().trim().max(500).optional(),
    title: z.string().trim().max(150).optional(),
  }),
});

const addMessageSchema = z.object({
  body: z.object({
    sender: z.enum(['user', 'bot']),
    text: z.string().trim().min(1, 'Message text is required').max(8000),
  }),
});

const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['applied', 'interview', 'offer', 'rejected']),
    notes: z.string().trim().max(2000).optional(),
  }),
});

module.exports = {
  createSessionSchema,
  addMessageSchema,
  updateApplicationStatusSchema,
};
