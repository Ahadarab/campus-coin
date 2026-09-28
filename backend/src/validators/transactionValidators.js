const validateTransaction = (req, res, next) => {
  const { amount, type, categoryId, description } = req.body;

  if (amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Amount must be a positive number greater than zero' });
  }

  if (!type || !['income', 'expense'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Type must be either "income" or "expense"' });
  }

  if (!categoryId) {
    return res.status(400).json({ success: false, message: 'Category is required' });
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Description is required' });
  }

  next();
};

const validateBudget = (req, res, next) => {
  const { categoryId, month, limitAmount } = req.body;

  if (!categoryId) {
    return res.status(400).json({ success: false, message: 'Category is required' });
  }

  if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return res.status(400).json({ success: false, message: 'Valid month is required (YYYY-MM)' });
  }

  if (limitAmount === undefined || isNaN(limitAmount) || Number(limitAmount) <= 0) {
    return res.status(400).json({ success: false, message: 'Limit amount must be greater than zero' });
  }

  next();
};

module.exports = {
  validateTransaction,
  validateBudget
};
