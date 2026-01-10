const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // link notification to logged-in user
    required: true,
  },
  message: { type: String, required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
  status: { type: String, enum: ["Upcoming", "Taken", "Missed"], default: "Upcoming"},
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
