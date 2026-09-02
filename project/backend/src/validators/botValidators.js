const { z } = require('zod');
const { BOT_AVATARS, BOT_ACTIVITY_ACTIONS } = require('../models/Bot');

const jobTypeEnum = z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']);
const workModeEnum = z.enum(['Remote', 'Hybrid', 'Onsite', 'Any']);

const configSchema = z.object({
  jobTitle: z.string().trim().min(2, 'Job title is required').max(150),
  jobType: jobTypeEnum.optional(),
  workMode: workModeEnum.optional(),
  minSalary: z.number().min(0).optional(),
  maxSalary: z.number().min(0).optional(),
  excludedCompanies: z.array(z.string().trim()).optional(),
});

const createBotSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Bot name is required').max(150),
    avatar: z.enum(BOT_AVATARS).optional(),
    config: configSchema,
  }),
});

const updateBotSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(150).optional(),
    avatar: z.enum(BOT_AVATARS).optional(),
    config: configSchema.partial().optional(),
  }),
});

const addActivitySchema = z.object({
  body: z.object({
    action: z.enum(BOT_ACTIVITY_ACTIONS),
    jobTitle: z.string().trim().max(200).optional(),
    company: z.string().trim().max(150).optional(),
    message: z.string().trim().max(500).optional(),
    // Only used when action === 'applied' and the bot found a real listing
    // in our own Jobs collection to file an Application against.
    jobId: z.string().trim().optional(),
  }),
});

module.exports = { createBotSchema, updateBotSchema, addActivitySchema };
