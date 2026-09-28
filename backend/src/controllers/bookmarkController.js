const Bookmark = require('../models/Bookmark');
const Tip = require('../models/Tip');
const Insight = require('../models/Insight');

/**
 * Get all bookmarks for the authenticated student
 * GET /api/bookmarks
 */
const getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: bookmarks.length,
      bookmarks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add bookmark
 * POST /api/bookmarks
 */
const createBookmark = async (req, res, next) => {
  try {
    const { contentType, contentId, title, snippet, metadata } = req.body;

    if (!contentType || !contentId) {
      return res.status(400).json({
        success: false,
        message: 'contentType (tip or insight) and contentId are required.'
      });
    }

    const bookmark = await Bookmark.findOneAndUpdate(
      { userId: req.user._id, contentType, contentId },
      {
        title: title || '',
        snippet: snippet || '',
        metadata: metadata || {}
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Item bookmarked successfully.',
      bookmark
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete bookmark
 * DELETE /api/bookmarks/:id
 */
const deleteBookmark = async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!bookmark) {
      return res.status(404).json({ success: false, message: 'Bookmark not found.' });
    }

    // Uncheck flag in Insight if applicable
    if (bookmark.contentType === 'insight') {
      await Insight.findOneAndUpdate(
        { _id: bookmark.contentId, userId: req.user._id },
        { isBookmarked: false }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Bookmark removed.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookmarks,
  createBookmark,
  deleteBookmark
};
