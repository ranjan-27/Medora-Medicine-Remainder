// jobs/agendaScheduler.js
const Agenda = require("agenda");
const moment = require("moment-timezone");
const { sendMedicineReminder } = require("../utils/emailHelper");
const { sendCaregiverWhatsApp } = require("../utils/whatsappHelper");


// Connect Agenda to MongoDB
const agenda = new Agenda({
  db: { address: process.env.MONGO_URI, collection: "agendaJobs" },
});

// Define the job
agenda.define("send medicine reminder", async (job) => {
  const { userEmail, caregiverPhone, medicineName, time, label } = job.attrs.data;
  console.log(`📧 Running job: ${medicineName} for ${userEmail || "no email"} at ${time} (${label || "at time"})`);

  try {
    if (userEmail) {
      await sendMedicineReminder(userEmail, medicineName, time);
      console.log("✅ Email sent successfully");
    }

    if (caregiverPhone) {
      const ok = await sendCaregiverWhatsApp(caregiverPhone, medicineName, time, label);
      if (ok) {
        console.log("📲 WhatsApp sent successfully");
      } else {
        console.log("❌ WhatsApp send failed");
      }
    }
  } catch (err) {
    console.error("❌ Failed to send reminder:", err);
  }
});


// Start Agenda
(async function () {
  await agenda.start();
})();

// Function to schedule reminders
async function scheduleMedicineReminders(userEmail, medicine) {
  // Parse "HH:mm" string into today's Date in IST
  let medicineTime;
  if (typeof medicine.time === "string" && medicine.time.includes(":")) {
    const [hours, minutes] = medicine.time.split(":").map(Number);
    medicineTime = moment.tz({ hour: hours, minute: minutes }, "Asia/Kolkata").toDate();
  } else {
    medicineTime = moment.tz(medicine.time, "Asia/Kolkata").toDate();
  }

  const now = new Date();
  const reminderTime = new Date(medicineTime.getTime() - 30 * 60000);

  // Only schedule if times are in the future
  if (reminderTime > now) {
    // Email reminder
    await agenda.schedule(reminderTime, "send medicine reminder", {
      userEmail,
      medicineName: medicine.name,
      time: medicine.time,
    });
    // WhatsApp reminders for each caregiver
    if (Array.isArray(medicine.caregivers)) {
      for (const cg of medicine.caregivers) {
        if (cg && cg.phone) {
          await agenda.schedule(reminderTime, "send medicine reminder", {
            caregiverPhone: cg.phone,
            medicineName: medicine.name,
            time: medicine.time,
            label: "30 min before",
          });
        }
      }
    }
    console.log(`📅 30‑minute reminder scheduled for ${medicine.name} at ${moment(reminderTime).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")} IST`);
  } else {
    console.log(`⚠️ Skipping 30‑minute reminder: ${moment(reminderTime).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")} IST is already past`);
  }

  if (medicineTime > now) {
    // Email reminder
    await agenda.schedule(medicineTime, "send medicine reminder", {
      userEmail,
      medicineName: medicine.name,
      time: medicine.time,
    });
    // WhatsApp reminders for each caregiver
    if (Array.isArray(medicine.caregivers)) {
      for (const cg of medicine.caregivers) {
        if (cg && cg.phone) {
          await agenda.schedule(medicineTime, "send medicine reminder", {
            caregiverPhone: cg.phone,
            medicineName: medicine.name,
            time: medicine.time,
            label: "Now",
          });
        }
      }
    }
    console.log(`📅 Exact‑time reminder scheduled for ${medicine.name} at ${moment(medicineTime).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")} IST`);
  } else {
    console.log(`⚠️ Skipping exact‑time reminder: ${moment(medicineTime).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")} IST is already past`);
  }
}

module.exports = { scheduleMedicineReminders, agenda };
