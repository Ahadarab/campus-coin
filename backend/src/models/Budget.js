const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    month: {
      type: String,
      required: [true, 'Month is required (Format: YYYY-MM)'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format']
    },
    limitAmount: {
      type: Number,
      required: [true, 'Budget limit amount is required'],
      min: [1, 'Limit must be at least 1']
    }
  },
  {
    timestamps: true
  }
);

// One budget per category per month per user
budgetSchema.index({ userId: 1, categoryId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
