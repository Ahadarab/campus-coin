const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Category = require('../models/Category');
const { generateFinancialReportPdf } = require('../services/reportPdfService');

const buildReportFilters = (query = {}) => {
  const filters = {};
  const { startDate, endDate, categoryId, incomeSourceId, type } = query;

  const selectedCategoryId = incomeSourceId || categoryId;
  if (selectedCategoryId) {
    if (!require('mongoose').isValidObjectId(selectedCategoryId)) {
      const error = new Error('Invalid category filter.');
      error.statusCode = 400;
      throw error;
    }
    filters.categoryId = selectedCategoryId;
  }

  if (type && ['income', 'expense'].includes(type)) filters.type = type;

  if (startDate || endDate) {
    filters.date = {};
    if (startDate) {
      const start = new Date(`${startDate}T00:00:00`);
      if (Number.isNaN(start.getTime())) {
        const error = new Error('Invalid start date.');
        error.statusCode = 400;
        throw error;
      }
      filters.date.$gte = start;
    }
    if (endDate) {
      const end = new Date(`${endDate}T23:59:59.999`);
      if (Number.isNaN(end.getTime())) {
        const error = new Error('Invalid end date.');
        error.statusCode = 400;
        throw error;
      }
      filters.date.$lte = end;
    }
    if (filters.date.$gte && filters.date.$lte && filters.date.$gte > filters.date.$lte) {
      const error = new Error('Start date cannot be after end date.');
      error.statusCode = 400;
      throw error;
    }
  }

  return filters;
};

const getScopedDateFilter = (baseStart, baseEnd, reportFilters) => {
  const date = { $gte: baseStart, $lte: baseEnd };
  if (reportFilters.date?.$gte && reportFilters.date.$gte > date.$gte) date.$gte = reportFilters.date.$gte;
  if (reportFilters.date?.$lte && reportFilters.date.$lte < date.$lte) date.$lte = reportFilters.date.$lte;
  return date;
};

/**
 * Monthly Category-Wise Spending Report
 * GET /api/reports/monthly?month=YYYY-MM
 */
const getMonthlyReport = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthStr = req.query.month || currentMonthStr;

    const [year, month] = monthStr.split('-').map(Number);
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const reportFilters = buildReportFilters(req.query);
    const reportStart = reportFilters.date?.$gte || startOfMonth;
    const reportEnd = reportFilters.date?.$lte || endOfMonth;
    const transactions = await Transaction.find({
      userId: req.user._id,
      ...reportFilters,
      date: getScopedDateFilter(reportStart, reportEnd, reportFilters)
    }).populate('categoryId');

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = {};

    transactions.forEach((tx) => {
      const cat = tx.categoryId;
      const catId = cat ? cat._id.toString() : 'other';
      const catName = cat ? cat.name : 'Uncategorized';
      const catColor = cat ? cat.color : '#6B7280';
      const catType = tx.type;

      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }

      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          id: catId,
          name: catName,
          type: catType,
          color: catColor,
          total: 0
        };
      }
      categoryMap[catId].total += tx.amount;
    });

    const categoryBreakdown = Object.values(categoryMap).map((c) => ({
      ...c,
      percentage:
        c.type === 'expense' && totalExpense > 0
          ? Math.round((c.total / totalExpense) * 100)
          : c.type === 'income' && totalIncome > 0
          ? Math.round((c.total / totalIncome) * 100)
          : 0
    }));

    // Find top spending category
    let topSpendingCategory = null;
    let highestSpend = 0;
    categoryBreakdown
      .filter((c) => c.type === 'expense')
      .forEach((c) => {
        if (c.total > highestSpend) {
          highestSpend = c.total;
          topSpendingCategory = c;
        }
      });

    // Budget comparison
    const budgets = await Budget.find({
      userId: req.user._id,
      month: monthStr
    }).populate('categoryId');

    const budgetComparison = budgets.map((b) => {
      const catId = b.categoryId ? b.categoryId._id.toString() : '';
      const catName = b.categoryId ? b.categoryId.name : 'Unknown';
      const spent = categoryMap[catId] ? categoryMap[catId].total : 0;
      const limit = b.limitAmount;
      const remaining = Math.max(0, limit - spent);
      const percentageConsumed = Math.round((spent / limit) * 100);

      return {
        categoryName: catName,
        limitAmount: limit,
        actualSpent: spent,
        remaining,
        percentageConsumed,
        status: spent > limit ? 'Exceeded' : percentageConsumed >= 80 ? 'Warning' : 'On Track'
      };
    });

    res.status(200).json({
      success: true,
      month: monthStr,
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        savings: Math.max(0, totalIncome - totalExpense),
        topSpendingCategory: topSpendingCategory ? topSpendingCategory.name : 'None',
        topSpendingAmount: highestSpend
      },
      categoryBreakdown,
      budgetComparison
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Six-Month Income vs Expense Report
 * GET /api/reports/six-months
 */
const getSixMonthsReport = async (req, res, next) => {
  try {
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      months.push({ monthStr, label, start, end });
    }

    const reportFilters = buildReportFilters(req.query);
    const sixMonthsAgo = months[0].start;
    const sixMonthsEnd = months[months.length - 1].end;
    const transactions = await Transaction.find({
      userId: req.user._id,
      ...reportFilters,
      date: getScopedDateFilter(sixMonthsAgo, sixMonthsEnd, reportFilters)
    });

    const reportData = months.map((m) => {
      let income = 0;
      let expense = 0;

      transactions.forEach((tx) => {
        const txDate = new Date(tx.date);
        if (txDate >= m.start && txDate <= m.end) {
          if (tx.type === 'income') {
            income += tx.amount;
          } else {
            expense += tx.amount;
          }
        }
      });

      return {
        month: m.monthStr,
        label: m.label,
        income,
        expense,
        balance: income - expense
      };
    });

    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Daily Spending Breakdown for Selected Month
 * GET /api/reports/daily?month=YYYY-MM
 */
const getDailyReport = async (req, res, next) => {
  try {
    const now = new Date();
    const monthStr = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [year, month] = monthStr.split('-').map(Number);

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const daysInMonth = new Date(year, month, 0).getDate();

    const reportFilters = buildReportFilters(req.query);
    const transactions = await Transaction.find({
      userId: req.user._id,
      ...reportFilters,
      date: getScopedDateFilter(startOfMonth, endOfMonth, reportFilters)
    });

    const dailyMap = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${monthStr}-${String(day).padStart(2, '0')}`;
      dailyMap[dayStr] = { date: dayStr, day, income: 0, expense: 0 };
    }

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (dailyMap[dayStr]) {
        if (tx.type === 'income') {
          dailyMap[dayStr].income += tx.amount;
        } else {
          dailyMap[dayStr].expense += tx.amount;
        }
      }
    });

    res.status(200).json({
      success: true,
      month: monthStr,
      days: Object.values(dailyMap)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Weekly Spending Breakdown for Selected Month
 * GET /api/reports/weekly?month=YYYY-MM
 */
const getWeeklyReport = async (req, res, next) => {
  try {
    const now = new Date();
    const monthStr = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [year, month] = monthStr.split('-').map(Number);

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const reportFilters = buildReportFilters(req.query);
    const transactions = await Transaction.find({
      userId: req.user._id,
      ...reportFilters,
      date: getScopedDateFilter(startOfMonth, endOfMonth, reportFilters)
    });

    const weeks = [
      { week: 'Week 1 (1st-7th)', start: 1, end: 7, income: 0, expense: 0 },
      { week: 'Week 2 (8th-14th)', start: 8, end: 14, income: 0, expense: 0 },
      { week: 'Week 3 (15th-21st)', start: 15, end: 21, income: 0, expense: 0 },
      { week: 'Week 4 (22nd-28th)', start: 22, end: 28, income: 0, expense: 0 },
      { week: 'Week 5 (29th+)', start: 29, end: 31, income: 0, expense: 0 }
    ];

    transactions.forEach((tx) => {
      const dateNum = new Date(tx.date).getDate();
      for (const w of weeks) {
        if (dateNum >= w.start && dateNum <= w.end) {
          if (tx.type === 'income') {
            w.income += tx.amount;
          } else {
            w.expense += tx.amount;
          }
          break;
        }
      }
    });

    res.status(200).json({
      success: true,
      month: monthStr,
      weeks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export Financial Report as PDF
 * GET /api/reports/export?month=YYYY-MM
 */
const exportReportPdf = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthStr = req.query.month || currentMonthStr;

    const [year, month] = monthStr.split('-').map(Number);
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const reportFilters = buildReportFilters(req.query);
    const reportStart = reportFilters.date?.$gte || startOfMonth;
    const reportEnd = reportFilters.date?.$lte || endOfMonth;
    const transactions = await Transaction.find({
      userId: req.user._id,
      ...reportFilters,
      date: getScopedDateFilter(reportStart, reportEnd, reportFilters)
    }).populate('categoryId');

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = {};

    transactions.forEach((tx) => {
      const cat = tx.categoryId;
      const catName = cat ? cat.name : 'Other';
      const catType = tx.type;

      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }

      if (!categoryMap[catName]) {
        categoryMap[catName] = { name: catName, type: catType, total: 0 };
      }
      categoryMap[catName].total += tx.amount;
    });

    const categoryBreakdown = Object.values(categoryMap).map((c) => ({
      ...c,
      percentage:
        c.type === 'expense' && totalExpense > 0
          ? (c.total / totalExpense) * 100
          : c.type === 'income' && totalIncome > 0
          ? (c.total / totalIncome) * 100
          : 0
    }));

    const budgets = await Budget.find({
      userId: req.user._id,
      month: monthStr
    }).populate('categoryId');

    const budgetComparison = budgets.map((b) => {
      const catName = b.categoryId ? b.categoryId.name : 'Unknown';
      const spent = categoryMap[catName] ? categoryMap[catName].total : 0;
      const limit = b.limitAmount;
      const remaining = Math.max(0, limit - spent);
      const percentageConsumed = Math.round((spent / limit) * 100);

      return {
        categoryName: catName,
        limitAmount: limit,
        actualSpent: spent,
        remaining,
        percentageConsumed,
        status: spent > limit ? 'Exceeded' : percentageConsumed >= 80 ? 'Warning' : 'On Track'
      };
    });

    const pdfBuffer = generateFinancialReportPdf({
      studentName: req.user.name,
      academicYear: req.user.academicYear,
      reportTitle: `Campus Coin Financial Statement (${reportFilters.date ? `${req.query.startDate || 'start'} to ${req.query.endDate || 'end'}` : monthStr})`,
      period: reportFilters.date ? `${req.query.startDate || 'start'} to ${req.query.endDate || 'end'}` : monthStr,
      currency: req.user.currency || '$',
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      },
      categoryBreakdown,
      budgetComparison
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CampusCoin_Report_${monthStr}.pdf"`);
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMonthlyReport,
  getSixMonthsReport,
  getDailyReport,
  getWeeklyReport,
  exportReportPdf
};
