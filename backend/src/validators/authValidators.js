const validateRegister = (req, res, next) => {
  const { name, email, password, academicYear, monthlyAllowanceBaseline, monthlySavingsGoal } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0 || !/^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u.test(name.trim()) || name.trim().length > 100) {
    return res.status(400).json({ success: false, message: 'Name may contain letters, spaces, apostrophes and hyphens only.' });
  }

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  if (academicYear && !['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Other'].includes(academicYear)) {
    return res.status(400).json({ success: false, message: 'Invalid academic year selection' });
  }

  if (monthlyAllowanceBaseline !== undefined && (isNaN(monthlyAllowanceBaseline) || Number(monthlyAllowanceBaseline) < 0)) {
    return res.status(400).json({ success: false, message: 'Monthly allowance must be a positive number or zero' });
  }

  if (monthlySavingsGoal !== undefined && (isNaN(monthlySavingsGoal) || Number(monthlySavingsGoal) < 0)) {
    return res.status(400).json({ success: false, message: 'Monthly savings goal must be a positive number or zero' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both email and password' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin
};
