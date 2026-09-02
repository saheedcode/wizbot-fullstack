const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 8000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatSessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    botName: {
      type: String,
      default: 'Wizbot',
      trim: true,
      maxlength: 100,
    },
    botAvatar: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      trim: true,
      maxlength: 150,
      default: 'New conversation',
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Sessions are always listed per-user, most recent first.
chatSessionSchema.index({ user: 1, updatedAt: -1 });

const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;
