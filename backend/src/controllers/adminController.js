const User = require('../models/User');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Tip = require('../models/Tip');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');

/**
 * Get all users with search, role & status filters
 * GET /api/admin/users
 */
const getUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    if (role && ['student', 'admin'].includes(role)) {
      query.role = role;
    }
    if (status && ['active', 'disabled'].includes(status)) {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * pageSize;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / pageSize),
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle user disable / enable status
 * PUT /api/admin/users/:id/disable
 */
const toggleDisableUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot disable your own admin account.' });
    }

    user.status = user.status === 'active' ? 'disabled' : 'active';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.status === 'active' ? 'activated' : 'disabled'}.`,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Default Category Management
 */
const getDefaultCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isDefault: true }).sort({ type: 1, name: 1 });
    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

const createDefaultCategory = async (req, res, next) => {
  try {
    const { name, type, color, icon } = req.body;
    if (!name || !type) {
      return res.status(400).json({ success: false, message: 'Name and type are required.' });
    }

    const category = await Category.create({
      name: name.trim(),
      type,
      color: color || '#4F46E5',
      icon: icon || 'tag',
      isDefault: true,
      userId: null
    });

    res.status(201).json({ success: true, message: 'System default category created.', category });
  } catch (error) {
    next(error);
  }
};

const updateDefaultCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category || !category.isDefault) {
      return res.status(404).json({ success: false, message: 'Default category not found.' });
    }

    const { name, color, icon, type } = req.body;
    if (name) category.name = name.trim();
    if (color) category.color = color;
    if (icon) category.icon = icon;
    if (type) category.type = type;

    await category.save();
    res.status(200).json({ success: true, message: 'Category updated.', category });
  } catch (error) {
    next(error);
  }
};

const deleteDefaultCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category || !category.isDefault) {
      return res.status(404).json({ success: false, message: 'Default category not found.' });
    }

    await Category.findByIdAndDelete(category._id);
    res.status(200).json({ success: true, message: 'Default category deleted.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Saving Tips Templates Management
 */
const getTipTemplates = async (req, res, next) => {
  try {
    const tips = await Tip.find({ userId: null }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, tips });
  } catch (error) {
    next(error);
  }
};

const createTipTemplate = async (req, res, next) => {
  try {
    const { title, description, categoryName, priority, savingsImpact } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    const tip = await Tip.create({
      title: title.trim(),
      description: description.trim(),
      categoryName: categoryName || '',
      priority: priority || 'medium',
      source: 'system',
      userId: null,
      savingsImpact: Number(savingsImpact) || 0
    });

    res.status(201).json({ success: true, message: 'Tip template created.', tip });
  } catch (error) {
    next(error);
  }
};

const updateTipTemplate = async (req, res, next) => {
  try {
    const tip = await Tip.findById(req.params.id);
    if (!tip || tip.userId !== null) {
      return res.status(404).json({ success: false, message: 'Tip template not found.' });
    }

    const { title, description, categoryName, priority, savingsImpact } = req.body;
    if (title) tip.title = title.trim();
    if (description) tip.description = description.trim();
    if (categoryName !== undefined) tip.categoryName = categoryName;
    if (priority) tip.priority = priority;
    if (savingsImpact !== undefined) tip.savingsImpact = Number(savingsImpact);

    await tip.save();
    res.status(200).json({ success: true, message: 'Tip template updated.', tip });
  } catch (error) {
    next(error);
  }
};

const deleteTipTemplate = async (req, res, next) => {
  try {
    const tip = await Tip.findById(req.params.id);
    if (!tip || tip.userId !== null) {
      return res.status(404).json({ success: false, message: 'Tip template not found.' });
    }

    await Tip.findByIdAndDelete(tip._id);
    res.status(200).json({ success: true, message: 'Tip template removed.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Announcements Management
 */
const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, announcements });
  } catch (error) {
    next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, priority } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      priority: priority || 'info',
      createdBy: req.user._id
    });

    // Broadcast in-app notification to all students
    const students = await User.find({ role: 'student' }).select('_id');
    const notifications = students.map((s) => ({
      userId: s._id,
      type: 'system_announcement',
      title: `📢 ${announcement.title}`,
      message: announcement.message,
      link: '/dashboard'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Announcement published and broadcast to students.',
      announcement
    });
  } catch (error) {
    next(error);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    const { title, message, priority, active } = req.body;
    if (title) announcement.title = title.trim();
    if (message) announcement.message = message.trim();
    if (priority) announcement.priority = priority;
    if (active !== undefined) announcement.active = Boolean(active);

    await announcement.save();
    res.status(200).json({ success: true, message: 'Announcement updated.', announcement });
  } catch (error) {
    next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }
    res.status(200).json({ success: true, message: 'Announcement deleted.' });
  } catch (error) {
    next(error);
  }
};

/**
 * System-Wide Statistics
 * GET /api/admin/statistics
 */
const getStatistics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      disabledUsers,
      totalTransactions,
      volumeAgg,
      categoryUsageAgg
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', status: 'active' }),
      User.countDocuments({ role: 'student', status: 'disabled' }),
      Transaction.countDocuments(),
      Transaction.aggregate([
        {
          $group: {
            _id: '$type',
            totalAmount: { $sum: '$amount' }
          }
        }
      ]),
      Transaction.aggregate([
        {
          $group: {
            _id: '$categoryId',
            count: { $sum: 1 },
            volume: { $sum: '$amount' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 8 },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' }
      ])
    ]);

    let totalIncomeVolume = 0;
    let totalExpenseVolume = 0;
    volumeAgg.forEach((v) => {
      if (v._id === 'income') totalIncomeVolume = v.totalAmount;
      if (v._id === 'expense') totalExpenseVolume = v.totalAmount;
    });

    const mostUsedCategories = categoryUsageAgg.map((item) => ({
      categoryId: item._id,
      categoryName: item.category.name,
      categoryType: item.category.type,
      categoryColor: item.category.color,
      count: item.count,
      volume: item.volume
    }));

    res.status(200).json({
      success: true,
      statistics: {
        totalUsers,
        activeUsers,
        disabledUsers,
        totalTransactions,
        totalIncomeVolume,
        totalExpenseVolume,
        mostUsedCategories
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
