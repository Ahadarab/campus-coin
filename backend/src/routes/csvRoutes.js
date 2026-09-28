const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const os = require('os');
const { previewCsv, importCsv } = require('../controllers/csvController');
const { protect } = require('../middleware/auth');

const upload = multer({
  dest: os.tmpdir(),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.csv') {
      return cb(new Error('Only CSV files (.csv) are allowed.'));
    }
    cb(null, true);
  }
});

router.use(protect);
router.post('/preview', upload.single('file'), previewCsv);
router.post('/', importCsv);

module.exports = router;
