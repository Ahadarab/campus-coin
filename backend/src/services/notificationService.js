const Notification = require('../models/Notification');

const createNotification = async ({ userId, type, title, message, link = '' }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      link
    });
    return notification;
  } catch (error) {
    console.error('[Notification Service Error]', error.message);
    return null;
  }
};

module.exports = {
  createNotification
};
