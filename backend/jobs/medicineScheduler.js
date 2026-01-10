// jobs/medicineScheduler.js
const cron = require("node-cron");
const { sendMedicineReminder } = require("../utils/emailHelper");
const { sendCaregiverWhatsApp } = require("../utils/whatsappHelper");


function scheduleMedicineReminders(userEmail, medicine) {
  // Parse "HH:mm" string into today's Date
  let medicineTime;
  if (typeof medicine.time === "string" && medicine.time.includes(":")) {
    const [hours, minutes] = medicine.time.split(":").map(Number);
    medicineTime = new Date();
    medicineTime.setHours(hours, minutes, 0, 0);
  } else {
    medicineTime = new Date(medicine.time); // fallback if already a Date
  }

  const reminderTime = new Date(medicineTime.getTime() - 30 * 60000);

  // 30 minutes before
  cron.schedule(
    `${reminderTime.getMinutes()} ${reminderTime.getHours()} * * *`,
    () => {
      sendMedicineReminder(userEmail, medicine.name, medicine.time);
      sendCaregiverWhatsApp(medicine.caregiverPhone, medicine.name, medicine.time, "30 min before");
    }
  );

  // At exact time
  cron.schedule(
    `${medicineTime.getMinutes()} ${medicineTime.getHours()} * * *`,
    () => {
      sendMedicineReminder(userEmail, medicine.name, medicine.time);
      sendCaregiverWhatsApp(medicine.caregiverPhone, medicine.name, medicine.time, "Now");
    }
  );
  if (medicine.caregiverPhone) { 
    sendCaregiverWhatsApp(medicine.caregiverPhone, medicine.name, medicine.time, "Added");
  }
  
}

module.exports = { scheduleMedicineReminders };
