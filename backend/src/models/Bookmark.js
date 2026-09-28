const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    contentType: {
      type: String,
      enum: ['tip', 'insight'],
      required: true
    },
    contentId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    snippet: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

bookmarkSchema.index({ userId: 1, contentType: 1, contentId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
