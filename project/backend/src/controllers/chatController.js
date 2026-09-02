const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const ChatSession = require('../models/ChatSession');

/**
 * POST /api/chat/sessions
 * Creates a new Wizbot chat session for the logged-in user.
 */
const createSession = catchAsync(async (req, res) => {
  const { botName, botAvatar, title } = req.body;

  const session = await ChatSession.create({
    user: req.user.id,
    ...(botName ? { botName } : {}),
    ...(botAvatar ? { botAvatar } : {}),
    ...(title ? { title } : {}),
  });

  return sendSuccess(res, 201, 'Chat session created successfully.', { session });
});

/**
 * GET /api/chat/sessions
 * Lists the logged-in user's chat sessions, most recently updated first.
 * Message bodies are excluded from the list view for a fast, lightweight payload;
 * fetch a single session for full message history.
 */
const getSessions = catchAsync(async (req, res) => {
  const { page = '1', limit = '20' } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);

  const filter = { user: req.user.id };

  const [sessions, total] = await Promise.all([
    ChatSession.find(filter)
      .select('botName botAvatar title createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    ChatSession.countDocuments(filter),
  ]);

  // Attach a lightweight preview (last message) instead of the full thread for list views.
  const withPreview = sessions.map(({ messages, ...rest }) => ({
    ...rest,
    messageCount: messages?.length || 0,
    lastMessage: messages?.length ? messages[messages.length - 1] : null,
  }));

  return sendSuccess(res, 200, 'Chat sessions fetched successfully.', { sessions: withPreview }, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
  });
});

/**
 * GET /api/chat/sessions/:sessionId
 * Fetches a single session with its full message history.
 */
const getSession = catchAsync(async (req, res) => {
  const session = await ChatSession.findOne({ _id: req.params.sessionId, user: req.user.id }).lean();
  if (!session) {
    throw new AppError('Chat session not found.', 404, 'SESSION_NOT_FOUND');
  }
  return sendSuccess(res, 200, 'Chat session fetched successfully.', { session });
});

/**
 * POST /api/chat/sessions/:sessionId/messages
 * Appends a message (from the user or the bot) to an existing session.
 */
const addMessage = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const { sender, text } = req.body;

  // $push + new:true keeps this a single atomic round-trip instead of
  // fetch -> mutate -> save, which is both faster and avoids lost updates
  // under concurrent requests.
  const session = await ChatSession.findOneAndUpdate(
    { _id: sessionId, user: req.user.id },
    { $push: { messages: { sender, text, timestamp: new Date() } } },
    { new: true, runValidators: true }
  );

  if (!session) {
    throw new AppError('Chat session not found.', 404, 'SESSION_NOT_FOUND');
  }

  return sendSuccess(res, 201, 'Message added successfully.', { session });
});

/**
 * DELETE /api/chat/sessions/:sessionId
 * Deletes a chat session belonging to the logged-in user.
 */
const deleteSession = catchAsync(async (req, res) => {
  const session = await ChatSession.findOneAndDelete({ _id: req.params.sessionId, user: req.user.id });
  if (!session) {
    throw new AppError('Chat session not found.', 404, 'SESSION_NOT_FOUND');
  }
  return sendSuccess(res, 200, 'Chat session deleted successfully.');
});

module.exports = { createSession, getSessions, getSession, addMessage, deleteSession };
