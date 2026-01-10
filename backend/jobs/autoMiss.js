const cron = require("node-cron");
const Medicine = require("../models/Medicine");
const { logNotification } = require("../utils/notifier");

function startAutoMissJob() {
  cron.schedule("*/5 * * * *", async () => { // every 5 minutes
    const now = new Date();
    try {
      const meds = await Medicine.find({ status: "Upcoming" });

      for (const med of meds) {
        const diffMinutes = (now - new Date(med.time)) / (1000 * 60);
        if (diffMinutes > 20) {
          med.status = "Missed";
          med.statusUpdatedAt = now;
          await med.save();
          await logNotification(med.user, `Medicine missed: ${med.name}`);
        }
      }
    } catch (err) {
      console.error("Auto-miss job error:", err.message);
    }
  });
}

module.exports = { startAutoMissJob };
