const express = require('express');
const router = express.Router();
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');
const { validateBudget } = require('../validators/transactionValidators');

router.use(protect);
router.get('/', getBudgets);
router.post('/', validateBudget, createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
