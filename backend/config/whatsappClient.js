const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

// Prefer installed Chrome if available (Windows local dev), otherwise Puppeteer's bundled Chromium
let chromeExec;
if (process.platform === "win32") {
  const chromePaths = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
  ];
  chromeExec = chromePaths.find((p) => fs.existsSync(p)) || puppeteer.executablePath();
} else {
  // On Render/Linux, always use Puppeteer's Chromium
  chromeExec = puppeteer.executablePath();
}

const client = new Client({
  authStrategy: new LocalAuth(),
  restartOnAuthFail: true,
  puppeteer: {
    executablePath: chromeExec,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--no-zygote",
      "--disable-gpu"
    ]
  }
});

client.on("qr", async (qr) => {
  console.log("\n");
  console.log(" Generating WhatsApp QR Code...");
  console.log("   1. Open WhatsApp on your phone");
  console.log("   2. Go to Settings > Linked Devices");
  console.log("   3. Tap 'Link a Device'");
  console.log("   4. Scan the QR code shown below\n");

  qrcode.generate(qr, { small: false });

  const qrPath = path.join(__dirname, "../assets/whatsapp-qr.png");
  const assetsDir = path.join(__dirname, "../assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  try {
    await QRCode.toFile(qrPath, qr, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF"
      }
    });
    console.log(` QR Code saved to: ${qrPath}`);
  } catch (err) {
    console.error(" Failed to generate QR code image:", err.message);
  }
});

client.on("ready", () => {
  console.log(" ✅ WhatsApp client is ready!");
});

client.on("disconnected", (reason) => {
  console.warn(" ⚠️ WhatsApp client disconnected:", reason);
  try {
    client.initialize();
  } catch (e) {
    console.error(" ❌ Failed to reinitialize WhatsApp client:", e.message);
  }
});

client.on("auth_failure", (msg) => {
  console.error(" ❌ WhatsApp auth failure:", msg);
});

client.initialize();

module.exports = client;
