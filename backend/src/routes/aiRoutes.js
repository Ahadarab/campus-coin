const express = require('express');
const router = express.Router();
const { categorize, monthlyInsight } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/categorize', categorize);
router.post('/monthly-insight', monthlyInsight);

module.exports = router;
