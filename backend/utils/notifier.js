// utils/notifier.js
const Notification = require("../models/Notification");

async function logNotification(userId, message, medicineId, status) {
  const notif = new Notification({
    user: userId,
    medicineId,
    message,
    status: status || "Upcoming", // 👈 default to Upcoming
    createdAt: new Date()
  });
  await notif.save();
}


module.exports = { logNotification };
