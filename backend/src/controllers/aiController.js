const { suggestCategory, generateMonthlyInsight } = require('../services/aiService');
const Transaction = require('../models/Transaction');

/**
 * Predict category from description
 * POST /api/ai/categorize
 */
const categorize = async (req, res, next) => {
  try {
    const { description, type = 'expense' } = req.body;
    const result = await suggestCategory(description, type);

    res.status(200).json({
      success: true,
      prediction: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate quick monthly insight
 * POST /api/ai/monthly-insight
 */
const monthlyInsight = async (req, res, next) => {
  try {
    const { month } = req.body;
    const now = new Date();
    const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [year, monthNum] = targetMonth.split('-').map(Number);
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);

    const transactions = await Transaction.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).populate('categoryId');

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};

    transactions.forEach((tx) => {
      const catName = tx.categoryId ? tx.categoryId.name : 'Other';
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
        categoryTotals[catName] = (categoryTotals[catName] || 0) + tx.amount;
      }
    });

    const result = await generateMonthlyInsight({
      month: targetMonth,
      studentName: req.user.name,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categoryTotals,
      savingsGoal: req.user.monthlySavingsGoal || 0
    });

    res.status(200).json({
      success: true,
      insight: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  categorize,
  monthlyInsight
};
