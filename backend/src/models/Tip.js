const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    categoryName: {
      type: String,
      default: ''
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    source: {
      type: String,
      enum: ['system', 'engine', 'ai'],
      default: 'system'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null for system default tips
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isDismissed: {
      type: Boolean,
      default: false
    },
    savingsImpact: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

tipSchema.index({ userId: 1, isDismissed: 1, isPinned: -1, priority: -1 });

module.exports = mongoose.model('Tip', tipSchema);
