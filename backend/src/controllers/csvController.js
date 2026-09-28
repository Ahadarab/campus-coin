const fs = require('fs');
const csvParser = require('csv-parser');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const { suggestCategory } = require('../services/aiService');
const { createNotification } = require('../services/notificationService');

/**
 * Preview uploaded CSV before importing
 * POST /api/import/csv/preview
 */
const previewCsv = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a CSV file.' });
  }

  const results = [];
  const errors = [];
  const validRows = [];
  let rowNumber = 1;

  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on('data', (row) => {
      rowNumber++;
      // Normalize keys to lowercase trim
      const cleanRow = {};
      for (const [key, value] of Object.entries(row)) {
        cleanRow[key.trim().toLowerCase()] = typeof value === 'string' ? value.trim() : value;
      }

      const { date, type, category, amount, description } = cleanRow;

      const rowErrors = [];

      // Validate required columns
      if (!date || isNaN(Date.parse(date))) {
        rowErrors.push('Invalid or missing date (expected YYYY-MM-DD)');
      }
      if (!type || !['income', 'expense'].includes(type.toLowerCase())) {
        rowErrors.push('Type must be "income" or "expense"');
      }
      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        rowErrors.push('Amount must be a number greater than 0');
      }
      if (!description) {
        rowErrors.push('Missing description');
      }

      const item = {
        rowNumber,
        date: date || new Date().toISOString().split('T')[0],
        type: (type || 'expense').toLowerCase(),
        category: category || 'Miscellaneous',
        amount: Number(amount) || 0,
        description: description || '',
        isValid: rowErrors.length === 0,
        errors: rowErrors
      };

      if (item.isValid) {
        validRows.push(item);
      } else {
        errors.push(item);
      }
      results.push(item);
    })
    .on('end', async () => {
      // Remove temporary file
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}

      // Batch suggest categories for items missing category or miscellaneous
      for (const row of results) {
        if (!row.category || row.category.toLowerCase() === 'miscellaneous') {
          const suggestion = await suggestCategory(row.description, row.type);
          row.aiSuggestedCategory = suggestion.category;
          if (!row.category) row.category = suggestion.category;
        }
      }

      res.status(200).json({
        success: true,
        summary: {
          totalRows: results.length,
          validCount: validRows.length,
          errorCount: errors.length
        },
        rows: results
      });
    })
    .on('error', (err) => {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
      next(err);
    });
};

/**
 * Import valid CSV rows into database
 * POST /api/import/csv
 */
const importCsv = async (req, res, next) => {
  try {
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid rows provided for import.' });
    }

    // Preload available categories for this student
    const existingCategories = await Category.find({
      $or: [{ isDefault: true }, { userId: req.user._id }]
    });

    const categoryMap = {};
    existingCategories.forEach((c) => {
      categoryMap[`${c.name.toLowerCase()}_${c.type}`] = c;
    });

    const transactionsToInsert = [];

    for (const r of rows) {
      if (!r.isValid) continue;

      const catName = (r.category || 'Miscellaneous').trim();
      const type = (r.type || 'expense').toLowerCase();
      const key = `${catName.toLowerCase()}_${type}`;

      let catObj = categoryMap[key];

      // Auto-create category if missing
      if (!catObj) {
        catObj = await Category.create({
          name: catName,
          type,
          isDefault: false,
          userId: req.user._id,
          color: type === 'income' ? '#10B981' : '#F59E0B'
        });
        categoryMap[key] = catObj;
      }

      transactionsToInsert.push({
        userId: req.user._id,
        categoryId: catObj._id,
        amount: Number(r.amount),
        type,
        description: r.description.trim(),
        date: new Date(r.date),
        aiSuggestedCategory: r.aiSuggestedCategory || null
      });
    }

    const inserted = await Transaction.insertMany(transactionsToInsert);

    // Create success notification
    await createNotification({
      userId: req.user._id,
      type: 'import_completed',
      title: 'CSV Import Completed',
      message: `Successfully imported ${inserted.length} transactions into your financial ledger.`,
      link: '/transactions'
    });

    res.status(200).json({
      success: true,
      message: `Successfully imported ${inserted.length} transactions.`,
      importedCount: inserted.length
    });
  } catch (error) {
    await createNotification({
      userId: req.user._id,
      type: 'import_failed',
      title: 'CSV Import Failed',
      message: `Error encountered while importing transactions: ${error.message}`,
      link: '/import'
    });
    next(error);
  }
};

module.exports = {
  previewCsv,
  importCsv
};
