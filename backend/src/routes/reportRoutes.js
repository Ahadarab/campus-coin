const express = require('express');
const router = express.Router();
const {
  getMonthlyReport,
  getSixMonthsReport,
  getDailyReport,
  getWeeklyReport,
  exportReportPdf
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/monthly', getMonthlyReport);
router.get('/six-months', getSixMonthsReport);
router.get('/daily', getDailyReport);
router.get('/weekly', getWeeklyReport);
router.get('/export', exportReportPdf);

module.exports = router;
