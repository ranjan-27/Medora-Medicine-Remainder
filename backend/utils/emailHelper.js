// utils/emailHelper.js
const path = require("path");
const transporter = require("../config/emailConfig");

async function sendMedicineReminder(to, medicineName, time) {
  const subject = "Medicine Reminder";
  const text = `Hello,

We’re Medora, here to remind you to take your medicine: ${medicineName} at ${time}.

Stay well,
The Medora Team`;

  try {
    await transporter.sendMail({
      from: `"Medora Alerts" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text, // plain text fallback
      html: `
        <div style="font-family: Arial, sans-serif; padding: 18px;">
          <img src="cid:medoraLogo" alt="Medora Logo" width="100" />
          <h2 style="color:#4CAF50;">Medicine Reminder</h2>
          <p>Hello,</p>
          <p>We’re Medora, here to remind you to take your medicine <b>${medicineName}</b> at <b>${time}</b>.</p>
          <p>Stay healthy,<br/>The Medora Team</p>
        </div>
      `,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../assets/logo.png"), // safer path resolution
          cid: "medoraLogo"
        }
      ]
    });
    console.log("✅ Reminder email sent to:", to);
  } catch (err) {
    console.error("❌ Email error:", err);
  }
}

module.exports = { sendMedicineReminder };
