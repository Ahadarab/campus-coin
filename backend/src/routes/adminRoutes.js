const express = require('express');
const router = express.Router();
const {
  getUsers,
  toggleDisableUser,
  getDefaultCategories,
  createDefaultCategory,
  updateDefaultCategory,
  deleteDefaultCategory,
  getTipTemplates,
  createTipTemplate,
  updateTipTemplate,
  deleteTipTemplate,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getStatistics
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');

router.use(protect);
router.use(adminOnly);

// Users
router.get('/users', getUsers);
router.put('/users/:id/disable', toggleDisableUser);

// Categories
router.get('/categories', getDefaultCategories);
router.post('/categories', createDefaultCategory);
router.put('/categories/:id', updateDefaultCategory);
router.delete('/categories/:id', deleteDefaultCategory);

// Tips
router.get('/tips', getTipTemplates);
router.post('/tips', createTipTemplate);
router.put('/tips/:id', updateTipTemplate);
router.delete('/tips/:id', deleteTipTemplate);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Statistics
router.get('/statistics', getStatistics);

module.exports = router;
