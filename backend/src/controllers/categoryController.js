const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

/**
 * Get all available categories (System defaults + Student personal categories)
 * GET /api/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = {
      $or: [{ isDefault: true }, { userId: req.user._id }]
    };

    if (type && ['income', 'expense'].includes(type)) {
      filter.type = type;
    }

    const categories = await Category.find(filter).sort({ isDefault: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create student personal category
 * POST /api/categories
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, type, color, icon } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Category name and type (income/expense) are required.'
      });
    }

    // Check duplicate among defaults or user's custom categories
    const existing = await Category.findOne({
      name: new RegExp(`^${name.trim()}$`, 'i'),
      type,
      $or: [{ isDefault: true }, { userId: req.user._id }]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A ${type} category named "${name.trim()}" already exists.`
      });
    }

    const category = await Category.create({
      name: name.trim(),
      type,
      color: color || '#4F46E5',
      icon: icon || 'tag',
      isDefault: false,
      userId: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Personal category created successfully.',
      category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update personal category
 * PUT /api/categories/:id
 */
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (category.isDefault) {
      return res.status(403).json({
        success: false,
        message: 'System default categories can only be modified by administrators.'
      });
    }

    if (category.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit categories that belong to you.'
      });
    }

    const { name, color, icon } = req.body;
    if (name) category.name = name.trim();
    if (color) category.color = color;
    if (icon) category.icon = icon;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete personal category
 * DELETE /api/categories/:id
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (category.isDefault) {
      return res.status(403).json({
        success: false,
        message: 'System default categories cannot be deleted by students.'
      });
    }

    if (category.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own categories.'
      });
    }

    // Check if transactions use this category
    const transactionCount = await Transaction.countDocuments({
      userId: req.user._id,
      categoryId: category._id
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${transactionCount} transaction(s) are linked to it. Please reassign or delete them first.`
      });
    }

    await Category.findByIdAndDelete(category._id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
