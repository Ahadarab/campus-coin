const express = require('express');
const router = express.Router();
const { getInsights, generateInsight, toggleBookmarkInsight } = require('../controllers/insightController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getInsights);
router.post('/generate', generateInsight);
router.post('/:id/bookmark', toggleBookmarkInsight);

module.exports = router;
