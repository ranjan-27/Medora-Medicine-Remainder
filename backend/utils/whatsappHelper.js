const client = require("../config/whatsappClient");
const { MessageMedia } = require("whatsapp-web.js");
const path = require("path");
const fs = require("fs");

// Default image path for all reminders
const DEFAULT_REMINDER_IMAGE = path.join(__dirname, "../assets/medora-reminder.png");

// Normalize to WhatsApp ID: e.g., 919876543210@c.us
function toWhatsAppId(phoneNumber) {
  let digits = String(phoneNumber || "").replace(/\D/g, "");
  // Default to India country code if 10-digit local number
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return `${digits}@c.us`;
}

let sendQueue = Promise.resolve();

async function sendCaregiverWhatsApp(phoneNumber, medicineName, time, label = "") {
  const chatId = toWhatsAppId(phoneNumber);
  
  // More engaging message formats
 let message;
  if (label === "Added") {
    message = `🏥 *Medora Health*\n\n👋 Hello!\nYou have been added as a caregiver for a medicine reminder.\n\n💊 Medicine: *${medicineName}*\n⏰ Time: *${time}*\n\nYou'll receive reminders to help them stay on track! 💙\n━━━━━━━━━━━━━━━━\n🏥 *मेडोरा स्वास्थ्य*\n\n👋 नमस्ते!\n\nआपको एक दवा रिमाइंडर के लिए केयरगिवर के रूप में जोड़ा गया है।\n\n💊 दवा: *${medicineName}*\n⏰ समय: *${time}*\n\nआप उन्हें ट्रैक पर रखने में मदद करने के लिए रिमाइंडर पाएंगे! 💙`;
  } else if (label === "30 min before") {
    message = `⏰ *Medora Reminder*\n\n🔔 Attention!\nMedicine due in 30 minutes:\n\n💊 *${medicineName}*\n⏰ Scheduled: *${time}*\n\nPlease remind them to take it! 💙\n━━━━━━━━━━━━━━━━\n⏰ *मेडोरा रिमाइंडर*\n\n🔔 ध्यान दें!\n\n30 मिनट में दवा का समय है:\n\n💊 *${medicineName}*\n⏰ निर्धारित: *${time}*\n\nकृपया उन्हें याद दिलाएं! 💙`;
  } else if (label === "Now") {
    message = `🔔 *Medora Alert*\n\n⏰ It's time!\nMedicine to take now:\n\n💊 *${medicineName}*\n⏰ Time: *${time}*\n\nPlease ensure they take their medicine! 💙\n━━━━━━━━━━━━━━━━\n🔔 *मेडोरा अलर्ट*\n\n⏰ अभी समय है!\n\nअभी दवा लेने का समय है:\n\n💊 *${medicineName}*\n⏰ समय: *${time}*\n\nकृपया सुनिश्चित करें कि वे अपनी दवा लें! 💙`;
  } else {
    message = label
      ? `Medora Reminder (${label}): ${medicineName} at ${time}\n\n━━━━━━━━━━━━━━━━\n\nमेडोरा रिमाइंडर (${label}): ${time} पर ${medicineName} लें`
      : `Medora Reminder: ${medicineName} at ${time}\n\n━━━━━━━━━━━━━━━━\n\nमेडोरा रिमाइंडर: ${time} पर ${medicineName} लें`;
  }

  // Basic validation
  const digits = String(phoneNumber || "").replace(/\D/g, "");
  if (digits.length < 10) {
    console.warn(`⚠️ Invalid caregiver phone: '${phoneNumber}' → digits='${digits}'. Skipping WhatsApp send.`);
    return;
  }

  if (!client.info || !client.info.wid) {
    console.log("⏳ WhatsApp client not ready—skipping WhatsApp send");
    return;
  }

  // Serialize sends to avoid puppeteer frame detachment
  const task = async () => {
    // Check if the number is on WhatsApp
    try {
      const isRegistered = await client.isRegisteredUser(chatId);
      if (!isRegistered) {
        console.warn(`⚠️ The number ${phoneNumber} (${chatId}) is not a WhatsApp user. Skipping.`);
        return false;
      }
    } catch (err) {
      console.warn(`⚠️ Could not verify WhatsApp registration for ${phoneNumber} (${chatId}): ${err.message}`);
    }

    try {
      console.log(`➡️ Sending WhatsApp to ${phoneNumber} as ${chatId} — ${message}`);
      
      // Send with image if it exists
      if (fs.existsSync(DEFAULT_REMINDER_IMAGE)) {
        const media = MessageMedia.fromFilePath(DEFAULT_REMINDER_IMAGE);
        await client.sendMessage(chatId, media, { caption: message });
        console.log(`📷 Image sent: ${DEFAULT_REMINDER_IMAGE}`);
      } else {
        await client.sendMessage(chatId, message);
      }
      
      console.log(`📲 WhatsApp sent to ${phoneNumber}: ${message}`);
      return true;
    } catch (err) {
      console.error(`❌ WhatsApp send failed to ${phoneNumber}:`, err.message);
      return false;
    }
  };

  sendQueue = sendQueue.then(task).catch(() => false);
  return sendQueue;
}

module.exports = { sendCaregiverWhatsApp };