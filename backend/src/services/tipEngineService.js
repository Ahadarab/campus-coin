const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Tip = require('../models/Tip');
const Category = require('../models/Category');

/**
 * Evaluates student's current spending against past averages and active budgets,
 * generating dynamic personalized tips ranked by potential savings impact.
 */
const generateDynamicTipsForUser = async (userId) => {
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Current month category spending
  const currentMonthAgg = await Transaction.aggregate([
    {
      $match: {
        userId,
        type: 'expense',
        date: { $gte: startOfCurrentMonth }
      }
    },
    {
      $group: {
        _id: '$categoryId',
        total: { $sum: '$amount' }
      }
    }
  ]);

  const currentSpendMap = {};
  currentMonthAgg.forEach((item) => {
    currentSpendMap[item._id.toString()] = item.total;
  });

  // 2. Historical spending prior to current month
  const historicalAgg = await Transaction.aggregate([
    {
      $match: {
        userId,
        type: 'expense',
        date: { $lt: startOfCurrentMonth }
      }
    },
    {
      $group: {
        _id: {
          categoryId: '$categoryId',
          yearMonth: { $dateToString: { format: '%Y-%m', date: '$date' } }
        },
        monthlyTotal: { $sum: '$amount' }
      }
    },
    {
      $group: {
        _id: '$_id.categoryId',
        avgMonthlySpend: { $avg: '$monthlyTotal' },
        monthsTracked: { $sum: 1 }
      }
    }
  ]);

  const historyMap = {};
  historicalAgg.forEach((item) => {
    historyMap[item._id.toString()] = {
      avg: item.avgMonthlySpend,
      months: item.monthsTracked
    };
  });

  // 3. User budgets for current month
  const activeBudgets = await Budget.find({
    userId,
    month: currentMonthStr
  }).populate('categoryId');

  // 4. Fetch category details for names
  const allCategories = await Category.find({});
  const categoryNameMap = {};
  allCategories.forEach((c) => {
    categoryNameMap[c._id.toString()] = c.name;
  });

  const generatedTips = [];

  // Check budgets
  for (const budget of activeBudgets) {
    const catId = budget.categoryId ? budget.categoryId._id.toString() : '';
    const catName = budget.categoryId ? budget.categoryId.name : 'Unknown';
    const spent = currentSpendMap[catId] || 0;
    const limit = budget.limitAmount;
    const percentage = Math.round((spent / limit) * 100);

    if (spent > limit) {
      const overspend = spent - limit;
      generatedTips.push({
        title: `Budget Exceeded in ${catName}`,
        description: `You have spent $${spent.toFixed(2)} of your $${limit.toFixed(2)} budget (${percentage}%). Consider freezing non-essential ${catName.toLowerCase()} expenses for the rest of the month.`,
        categoryId: budget.categoryId ? budget.categoryId._id : null,
        categoryName: catName,
        priority: 'high',
        source: 'engine',
        savingsImpact: overspend,
        userId
      });
    } else if (percentage >= 80) {
      const remaining = limit - spent;
      generatedTips.push({
        title: `${catName} Nearing Monthly Limit`,
        description: `You've used ${percentage}% of your ${catName} budget. You have $${remaining.toFixed(2)} remaining. Review your daily habits to stay under limit.`,
        categoryId: budget.categoryId ? budget.categoryId._id : null,
        categoryName: catName,
        priority: 'medium',
        source: 'engine',
        savingsImpact: remaining * 0.5,
        userId
      });
    }
  }

  // Check historical average deviations
  for (const [catId, currentSpent] of Object.entries(currentSpendMap)) {
    const hist = historyMap[catId];
    const catName = categoryNameMap[catId] || 'Category';

    if (hist && hist.avg > 0) {
      const diff = currentSpent - hist.avg;
      if (diff > 25 && currentSpent > hist.avg * 1.2) {
        generatedTips.push({
          title: `Unusual Spending Spike in ${catName}`,
          description: `Your ${catName} spending ($${currentSpent.toFixed(2)}) is $${diff.toFixed(2)} higher than your historical average ($${hist.avg.toFixed(2)}). Look for student discount codes or cooking meals at home.`,
          categoryId: catId,
          categoryName: catName,
          priority: 'high',
          source: 'engine',
          savingsImpact: diff,
          userId
        });
      }
    }
  }

  // Rank generated tips by estimated savings impact descending
  generatedTips.sort((a, b) => b.savingsImpact - a.savingsImpact);

  return generatedTips;
};

module.exports = {
  generateDynamicTipsForUser
};
