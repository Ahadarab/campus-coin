const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

/**
 * Get all budgets for a given month with calculated actual spending and alert states
 * GET /api/budgets?month=YYYY-MM
 */
const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const selectedMonth = req.query.month || currentMonthStr;

    // Parse month bounds
    const [year, month] = selectedMonth.split('-').map(Number);
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const budgets = await Budget.find({
      userId: req.user._id,
      month: selectedMonth
    }).populate('categoryId');

    // Aggregate actual expenses for this user in this month by category
    const spendingAgg = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$categoryId',
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);

    const spendingMap = {};
    spendingAgg.forEach((item) => {
      spendingMap[item._id.toString()] = item.totalSpent;
    });

    let totalBudgeted = 0;
    let totalSpentInBudgets = 0;

    const enrichedBudgets = budgets.map((b) => {
      const catId = b.categoryId ? b.categoryId._id.toString() : '';
      const actualSpent = spendingMap[catId] || 0;
      const limit = b.limitAmount;
      const remaining = Math.max(0, limit - actualSpent);
      const percentageConsumed = Math.round((actualSpent / limit) * 100);

      totalBudgeted += limit;
      totalSpentInBudgets += actualSpent;

      let status = 'normal';
      if (actualSpent > limit) {
        status = 'exceeded';
      } else if (percentageConsumed >= 80) {
        status = 'warning';
      }

      return {
        _id: b._id,
        categoryId: b.categoryId,
        categoryName: b.categoryId ? b.categoryId.name : 'Unknown',
        categoryColor: b.categoryId ? b.categoryId.color : '#4F46E5',
        month: b.month,
        limitAmount: limit,
        actualSpent,
        remaining,
        percentageConsumed,
        status,
        createdAt: b.createdAt
      };
    });

    res.status(200).json({
      success: true,
      month: selectedMonth,
      summary: {
        totalBudgeted,
        totalSpentInBudgets,
        overallPercentage: totalBudgeted > 0 ? Math.round((totalSpentInBudgets / totalBudgeted) * 100) : 0
      },
      budgets: enrichedBudgets
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new monthly budget
 * POST /api/budgets
 */
const createBudget = async (req, res, next) => {
  try {
    const { categoryId, month, limitAmount } = req.body;

    const category = await Category.findOne({
      _id: categoryId,
      $or: [{ isDefault: true }, { userId: req.user._id }]
    });

    if (!category) {
      return res.status(400).json({ success: false, message: 'Invalid category selected.' });
    }

    if (category.type !== 'expense') {
      return res.status(400).json({
        success: false,
        message: 'Budgets can only be set for expense categories.'
      });
    }

    const existingBudget = await Budget.findOne({
      userId: req.user._id,
      categoryId,
      month
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: `A budget for "${category.name}" in ${month} already exists. You can edit it instead.`
      });
    }

    const budget = await Budget.create({
      userId: req.user._id,
      categoryId,
      month,
      limitAmount: Number(limitAmount)
    });

    await budget.populate('categoryId', 'name type color icon');

    res.status(201).json({
      success: true,
      message: 'Budget established successfully.',
      budget
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update budget limit
 * PUT /api/budgets/:id
 */
const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found.' });
    }

    const { limitAmount } = req.body;
    if (limitAmount !== undefined) {
      if (Number(limitAmount) <= 0) {
        return res.status(400).json({ success: false, message: 'Budget limit must be greater than zero.' });
      }
      budget.limitAmount = Number(limitAmount);
    }

    await budget.save();
    await budget.populate('categoryId', 'name type color icon');

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully.',
      budget
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete budget
 * DELETE /api/budgets/:id
 */
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Budget removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};
