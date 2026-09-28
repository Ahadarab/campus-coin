const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    month: {
      type: String,
      required: true
    },
    summaryText: {
      type: String,
      required: true
    },
    notablePattern: {
      type: String,
      default: ''
    },
    tipText: {
      type: String,
      required: true
    },
    isBookmarked: {
      type: Boolean,
      default: false
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

insightSchema.index({ userId: 1, month: -1 });

module.exports = mongoose.model('Insight', insightSchema);
