const Medicine = require("../models/Medicine");
const { logNotification } = require("../utils/notifier");
const { sendMedicineReminder } = require("../utils/emailHelper");
const User = require("../models/User");
const { scheduleMedicineReminders } = require("../jobs/agendaScheduler");
const { sendCaregiverWhatsApp } = require("../utils/whatsappHelper");



// Add medicine


// Add medicine
exports.addMedicine = async (req, res) => {
  try {
    const medicine = new Medicine({ ...req.body, user: req.userId });
    await medicine.save();

    await logNotification(
      req.userId,
      `Medicine added: ${medicine.name}`,
      medicine._id,
      medicine.status
    );

    const user = await User.findById(req.userId);
    if (user && user.email) {
      // Send immediate confirmation email
      console.log(`📧 Sending email to ${user.email} for ${medicine.name} at ${medicine.time}`);
       sendMedicineReminder(user.email, medicine.name, medicine.time);
      await scheduleMedicineReminders(user.email, medicine);
      // Schedule reminders (30 min before + at time)
      
    }
    // Send WhatsApp to all caregivers with phones
    if (Array.isArray(medicine.caregivers)) {
      for (const cg of medicine.caregivers) {
        if (cg && cg.phone) {
          console.log(`📲 Queuing WhatsApp to caregiver ${cg.name || "(no name)"} at ${cg.phone}`);
          await sendCaregiverWhatsApp(cg.phone, medicine.name, medicine.time, "Added");
        }
      }
    }
    else {
      console.warn("⚠️ No user email found, skipping reminders");
    }

    res.json({ medicine });
  } catch (err) {
    console.error("❌ Error in addMedicine:", err);
    res.status(500).json({ error: err.message });
  }
};



// Get medicines
exports.getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ user: req.userId });
    res.json({ medicines });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update medicine
exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    await logNotification(
      req.userId,
      `Medicine updated: ${medicine.name}`,
      medicine._id,
      medicine.status || "Upcoming"
    );

    res.json({ medicine });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Delete medicine
exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!medicine) return res.status(404).json({ error: "Medicine not found" });

    // Log notification
    await logNotification(req.userId, `Medicine deleted: ${medicine.name}`, medicine._id, medicine.status);

    res.json({ message: "Medicine deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.missedMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      user: req.userId,
    });
    if (!medicine) return res.status(404).json({ error: "Medicine not found" });

    await logNotification(
      req.userId,
      `You missed ${medicine.name} at ${medicine.time}`,
      medicine._id,
      "Missed"
    );

    res.json({ message: "Missed notification logged" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


// Explicit: mark taken
exports.markTaken = async (req, res) => {
  try {
    const med = await Medicine.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { status: "Taken", statusUpdatedAt: new Date() },
      { new: true }
    );
    if (!med) return res.status(404).json({ error: "Medicine not found" });

    await logNotification(req.userId, `Medicine taken: ${med.name}`, med._id, "Taken");
    res.json({ medicine: med });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Explicit: mark missed
exports.markMissed = async (req, res) => {
  try {
    const med = await Medicine.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { status: "Missed", statusUpdatedAt: new Date() },
      { new: true }
    );
    if (!med) return res.status(404).json({ error: "Medicine not found" });

    await logNotification(req.userId, `Medicine missed: ${med.name}`, med._id, "Missed");
    res.json({ medicine: med });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};