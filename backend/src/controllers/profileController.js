const User = require('../models/User');

/**
 * Get current student profile
 * GET /api/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current student profile
 * PUT /api/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      academicYear,
      monthlyAllowanceBaseline,
      monthlySavingsGoal,
      currency
    } = req.body;

    const user = await User.findById(req.user._id);

    if (name !== undefined) {
      const cleanName = String(name).trim();
      if (!/^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u.test(cleanName) || cleanName.length > 100) {
        return res.status(400).json({ success: false, message: 'Name may contain letters, spaces, apostrophes and hyphens only.' });
      }
      user.name = cleanName;
    }
    if (academicYear) user.academicYear = academicYear;
    if (monthlyAllowanceBaseline !== undefined) {
      user.monthlyAllowanceBaseline = Number(monthlyAllowanceBaseline);
    }
    if (monthlySavingsGoal !== undefined) {
      user.monthlySavingsGoal = Number(monthlySavingsGoal);
    }
    if (currency) user.currency = currency;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
};
