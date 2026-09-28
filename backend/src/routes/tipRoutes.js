const express = require('express');
const router = express.Router();
const { getTips, pinTip, dismissTip } = require('../controllers/tipController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getTips);
router.post('/:id/pin', pinTip);
router.post('/:id/dismiss', dismissTip);

module.exports = router;
