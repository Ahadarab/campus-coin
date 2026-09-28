const Insight = require('../models/Insight');
const Transaction = require('../models/Transaction');
const Bookmark = require('../models/Bookmark');
const { generateMonthlyInsight } = require('../services/aiService');
const { createNotification } = require('../services/notificationService');

/**
 * Get student monthly insights history
 * GET /api/insights
 */
const getInsights = async (req, res, next) => {
  try {
    const insights = await Insight.find({ userId: req.user._id }).sort({ generatedAt: -1 });
    res.status(200).json({
      success: true,
      insights
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate AI Monthly Insight for current or specified month
 * POST /api/insights/generate
 */
const generateInsight = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const month = req.body.month || currentMonthStr;

    const [year, monthNum] = month.split('-').map(Number);
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);

    // Fetch transactions in this month
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

    const balance = totalIncome - totalExpense;

    const aiOutput = await generateMonthlyInsight({
      month,
      studentName: req.user.name,
      totalIncome,
      totalExpense,
      balance,
      categoryTotals,
      savingsGoal: req.user.monthlySavingsGoal || 0
    });

    // Create or update insight for this month
    let insight = await Insight.findOne({ userId: req.user._id, month });
    if (insight) {
      insight.summaryText = aiOutput.summary;
      insight.notablePattern = aiOutput.notablePattern;
      insight.tipText = aiOutput.recommendation;
      insight.generatedAt = new Date();
      await insight.save();
    } else {
      insight = await Insight.create({
        userId: req.user._id,
        month,
        summaryText: aiOutput.summary,
        notablePattern: aiOutput.notablePattern,
        tipText: aiOutput.recommendation,
        generatedAt: new Date()
      });
    }

    // Trigger notification
    await createNotification({
      userId: req.user._id,
      type: 'insight_generated',
      title: `📊 Monthly Financial Insights Ready (${month})`,
      message: `Your personalized spending analysis for ${month} has been synthesized by the AI advisor.`,
      link: '/insights'
    });

    res.status(200).json({
      success: true,
      message: 'Monthly financial insight generated.',
      insight: {
        ...insight.toObject(),
        disclaimer: aiOutput.disclaimer
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle bookmark on insight
 * POST /api/insights/:id/bookmark
 */
const toggleBookmarkInsight = async (req, res, next) => {
  try {
    const insight = await Insight.findOne({ _id: req.params.id, userId: req.user._id });
    if (!insight) {
      return res.status(404).json({ success: false, message: 'Insight not found.' });
    }

    insight.isBookmarked = !insight.isBookmarked;
    await insight.save();

    if (insight.isBookmarked) {
      await Bookmark.findOneAndUpdate(
        { userId: req.user._id, contentType: 'insight', contentId: insight._id.toString() },
        {
          title: `Financial Insights (${insight.month})`,
          snippet: insight.summaryText.substring(0, 120) + '...',
          metadata: { month: insight.month }
        },
        { upsert: true, new: true }
      );
    } else {
      await Bookmark.findOneAndDelete({
        userId: req.user._id,
        contentType: 'insight',
        contentId: insight._id.toString()
      });
    }

    res.status(200).json({
      success: true,
      message: insight.isBookmarked ? 'Insight bookmarked.' : 'Bookmark removed.',
      isBookmarked: insight.isBookmarked
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInsights,
  generateInsight,
  toggleBookmarkInsight
};
