const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

jest.mock('../services/cloudinaryService', () => ({
  uploadBufferToCloudinary: jest.fn().mockResolvedValue({
    url: 'https://res.cloudinary.com/demo/image/upload/mock-avatar.jpg',
    publicId: 'wizjobai/avatars/mock-avatar',
  }),
  uploadDocumentToCloudinary: jest.fn().mockResolvedValue({
    url: 'https://res.cloudinary.com/demo/raw/upload/mock-resume.pdf',
    publicId: 'wizjobai/resumes/mock-resume',
  }),
  deleteFromCloudinary: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../services/emailService', () => ({
  sendOtpEmail: jest.fn().mockResolvedValue(undefined),
}));

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
});
