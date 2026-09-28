const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Category type must be either income or expense']
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null indicates system default category
    },
    color: {
      type: String,
      default: '#4F46E5'
    },
    icon: {
      type: String,
      default: 'tag'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure uniqueness per user (or among defaults)
categorySchema.index({ name: 1, type: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
