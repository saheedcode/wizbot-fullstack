const { z } = require('zod');

const employmentTypeEnum = z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']);
const workModeEnum = z.enum(['Remote', 'Hybrid', 'Onsite']);

const createJobSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2, 'Title must be at least 2 characters').max(150),
    company: z.string().trim().min(1, 'Company is required').max(150),
    companyLogoUrl: z.string().trim().url('Must be a valid URL').optional(),
    location: z.string().trim().min(1, 'Location is required').max(150),
    employmentType: employmentTypeEnum.optional(),
    workMode: workModeEnum.optional(),
    salaryMin: z.number().min(0).optional(),
    salaryMax: z.number().min(0).optional(),
    currency: z.string().trim().max(10).optional(),
    description: z.string().trim().min(1, 'Description is required'),
    requirements: z.array(z.string().trim()).optional(),
    skills: z.array(z.string().trim()).optional(),
  }),
});

// All fields optional on update - only what's provided gets changed.
const updateJobSchema = z.object({
  body: createJobSchema.shape.body.partial(),
});

// Matches the reasons offered in the "Report this job" modal.
const reportJobSchema = z.object({
  body: z.object({
    reason: z.enum(['not_accepting_applications', 'spam', 'fraud_or_scam', 'misleading_description', 'other']),
    description: z.string().trim().max(2000).optional(),
  }),
});

module.exports = { createJobSchema, updateJobSchema, reportJobSchema };
