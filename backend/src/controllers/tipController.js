const Tip = require('../models/Tip');
const { generateDynamicTipsForUser } = require('../services/tipEngineService');

/**
 * Get all saving tips for the current student
 * Merges system templates with dynamically generated tips based on student's own spending.
 * GET /api/tips
 */
const getTips = async (req, res, next) => {
  try {
    // 1. Fetch persistent tips for user or system default templates
    const persistentTips = await Tip.find({
      $or: [{ userId: req.user._id }, { userId: null, isDismissed: false }]
    }).populate('categoryId');

    // Filter out dismissed
    const userTips = persistentTips.filter((t) => !t.isDismissed);

    // 2. Generate dynamic spending engine tips
    const dynamicTips = await generateDynamicTipsForUser(req.user._id);

    // Filter out dynamic tips that might already be in userTips by title
    const existingTitles = new Set(userTips.map((t) => t.title.toLowerCase()));
    const newDynamicTips = dynamicTips.filter((t) => !existingTitles.has(t.title.toLowerCase()));

    // Combine
    const allTips = [...userTips, ...newDynamicTips];

    // Sort: Pinned first, then high priority, then highest savings impact
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    allTips.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      const pDiff = (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
      if (pDiff !== 0) return pDiff;
      return (b.savingsImpact || 0) - (a.savingsImpact || 0);
    });

    res.status(200).json({
      success: true,
      count: allTips.length,
      tips: allTips
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Pin a tip
 * POST /api/tips/:id/pin
 */
const pinTip = async (req, res, next) => {
  try {
    let tip = await Tip.findById(req.params.id);

    if (!tip) {
      return res.status(404).json({ success: false, message: 'Tip not found.' });
    }

    // If it's a global template, clone it for this student so their pin is personal
    if (!tip.userId) {
      tip = await Tip.create({
        title: tip.title,
        description: tip.description,
        categoryId: tip.categoryId,
        categoryName: tip.categoryName,
        priority: tip.priority,
        source: tip.source,
        userId: req.user._id,
        isPinned: true,
        isDismissed: false,
        savingsImpact: tip.savingsImpact
      });
    } else {
      if (tip.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized.' });
      }
      tip.isPinned = !tip.isPinned;
      await tip.save();
    }

    res.status(200).json({
      success: true,
      message: tip.isPinned ? 'Tip pinned to top.' : 'Tip unpinned.',
      tip
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dismiss a tip
 * POST /api/tips/:id/dismiss
 */
const dismissTip = async (req, res, next) => {
  try {
    let tip = await Tip.findById(req.params.id);

    if (!tip) {
      return res.status(404).json({ success: false, message: 'Tip not found.' });
    }

    // If global template, clone and mark dismissed for this user
    if (!tip.userId) {
      await Tip.create({
        title: tip.title,
        description: tip.description,
        categoryId: tip.categoryId,
        categoryName: tip.categoryName,
        priority: tip.priority,
        source: tip.source,
        userId: req.user._id,
        isPinned: false,
        isDismissed: true,
        savingsImpact: tip.savingsImpact
      });
    } else {
      if (tip.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized.' });
      }
      tip.isDismissed = true;
      await tip.save();
    }

    res.status(200).json({
      success: true,
      message: 'Tip dismissed.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTips,
  pinTip,
  dismissTip
};
