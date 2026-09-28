const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Budget = require('../models/Budget');
const { suggestCategory } = require('../services/aiService');
const { createNotification } = require('../services/notificationService');
const { initialOccurrence } = require('../services/recurringService');

/**
 * Helper to check budget threshold and alert student
 */
const checkBudgetAfterExpense = async (userId, categoryId, date = new Date()) => {
  try {
    const expenseDate = new Date(date);
    const monthStr = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;

    const budget = await Budget.findOne({ userId, categoryId, month: monthStr }).populate('categoryId');
    if (!budget) return;

    // Sum all expenses for this category in this month
    const startOfMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), 1);
    const endOfMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const agg = await Transaction.aggregate([
      {
        $match: {
          userId,
          categoryId: budget.categoryId._id,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalSpent = agg.length > 0 ? agg[0].total : 0;
    const catName = budget.categoryId.name;
    const limit = budget.limitAmount;
    const percentage = Math.round((totalSpent / limit) * 100);

    if (totalSpent > limit) {
      await createNotification({
        userId,
        type: 'budget_exceeded',
        title: `🚨 Budget Exceeded: ${catName}`,
        message: `You have spent $${totalSpent.toFixed(2)} on ${catName} in ${monthStr}, exceeding your limit of $${limit.toFixed(2)} by $${(totalSpent - limit).toFixed(2)} (${percentage}% consumed).`,
        link: '/budgets'
      });
    } else if (percentage >= 80) {
      await createNotification({
        userId,
        type: 'budget_approaching',
        title: `⚠️ Budget Warning: ${catName}`,
        message: `You have spent ${percentage}% ($${totalSpent.toFixed(2)} of $${limit.toFixed(2)}) of your ${catName} budget for ${monthStr}.`,
        link: '/budgets'
      });
    }
  } catch (err) {
    console.error('[Budget Check Error]', err.message);
  }
};

/**
 * Get student transactions with search, filter, sort & pagination
 * GET /api/transactions
 */
const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      categoryId,
      search,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const query = { userId: req.user._id };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (search && search.trim()) {
      query.description = { $regex: search.trim(), $options: 'i' };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * pageSize;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('categoryId', 'name type color icon')
        .sort(sortOptions)
        .skip(skip)
        .limit(pageSize),
      Transaction.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / pageSize),
      transactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single transaction by ID
 * GET /api/transactions/:id
 */
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('categoryId');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new transaction (Income or Expense)
 * POST /api/transactions
 */
const createTransaction = async (req, res, next) => {
  try {
    const {
      categoryId,
      amount,
      type,
      description,
      date,
      aiSuggestedCategory,
      isRecurring,
      recurrenceFrequency,
      nextOccurrence
    } = req.body;

    // Verify category exists
    const category = await Category.findOne({
      _id: categoryId,
      $or: [{ isDefault: true }, { userId: req.user._id }]
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected.'
      });
    }

    // Auto-predict AI suggested category if not provided
    let aiSuggestion = aiSuggestedCategory;
    if (!aiSuggestion) {
      const prediction = await suggestCategory(description, type);
      aiSuggestion = prediction.category;
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      categoryId,
      amount: Number(amount),
      type,
      description: description.trim(),
      date: date ? new Date(date) : new Date(),
      aiSuggestedCategory: aiSuggestion,
      isRecurring: Boolean(isRecurring),
      recurrenceFrequency: recurrenceFrequency || 'none',
      nextOccurrence: nextOccurrence ? new Date(nextOccurrence) : (isRecurring && recurrenceFrequency && recurrenceFrequency !== 'none' ? initialOccurrence(date ? new Date(date) : new Date(), recurrenceFrequency) : null)
    });

    // Populate category before returning
    await transaction.populate('categoryId', 'name type color icon');

    // Trigger budget threshold evaluation if expense
    if (type === 'expense') {
      checkBudgetAfterExpense(req.user._id, categoryId, transaction.date);
    }

    res.status(201).json({
      success: true,
      message: `${type === 'income' ? 'Income' : 'Expense'} recorded successfully.`,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update transaction
 * PUT /api/transactions/:id
 */
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    const {
      categoryId,
      amount,
      type,
      description,
      date,
      isRecurring,
      recurrenceFrequency,
      nextOccurrence
    } = req.body;

    if (categoryId) {
      const category = await Category.findOne({
        _id: categoryId,
        $or: [{ isDefault: true }, { userId: req.user._id }]
      });
      if (!category) {
        return res.status(400).json({ success: false, message: 'Invalid category.' });
      }
      transaction.categoryId = categoryId;
    }

    if (amount !== undefined) transaction.amount = Number(amount);
    if (type) transaction.type = type;
    if (description) transaction.description = description.trim();
    if (date) transaction.date = new Date(date);
    if (isRecurring !== undefined) transaction.isRecurring = Boolean(isRecurring);
    if (recurrenceFrequency) transaction.recurrenceFrequency = recurrenceFrequency;
    if (nextOccurrence !== undefined) {
      transaction.nextOccurrence = nextOccurrence ? new Date(nextOccurrence) : null;
    }

    await transaction.save();
    await transaction.populate('categoryId', 'name type color icon');

    if (transaction.type === 'expense') {
      checkBudgetAfterExpense(req.user._id, transaction.categoryId._id, transaction.date);
    }

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete transaction
 * DELETE /api/transactions/:id
 */
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
