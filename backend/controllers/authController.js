const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');              // OTP model
const transporter = require('../config/emailConfig'); // Nodemailer config
const crypto = require('crypto');

// Signup (creates user with verified=false)
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user (unverified by default)
    const user = new User({ name, email, password: hashedPassword, verified: false });
    await user.save();

    res.status(201).json({
      message: "Signup successful. Please check your email for OTP to verify your account.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login (only verified users)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.verified) {
      return res.status(403).json({ error: 'Email not verified. Please check your inbox for OTP.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send OTP via email
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Save OTP in DB with 5 min expiry
    await OTP.deleteMany({ email }); // clear old OTPs
    await OTP.create({ email, otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

    console.log("Generated OTP:", otp); // 🔎 Debug log

    // Send OTP via Nodemailer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });

    res.json({ success: true, message: 'OTP sent to email' });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("Verifying OTP:", otp, "for email:", email); // 🔎 Debug log

    // Normalize type: always compare as string
    const record = await OTP.findOne({ email, otp: otp.toString() });
    if (!record) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check expiry
    if (new Date(record.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Mark user verified
    await User.updateOne({ email }, { $set: { verified: true } });
    await OTP.deleteMany({ email });

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// Profile
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, age, phone } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (age) user.age = age;
    if (phone) user.phone = phone;

    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Forgot Password - send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = crypto.randomInt(100000, 999999).toString();

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

    console.log("Forgot Password OTP:", otp);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It expires in 5 minutes.`,
    });

    res.json({ success: true, message: "OTP sent to email for password reset" });
  } catch (err) {
    console.error("Forgot Password error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// Reset Password - verify OTP and set new password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = await OTP.findOne({ email, otp: otp.toString() });
    if (!record) return res.status(400).json({ error: "Invalid OTP" });
    if (new Date(record.expiresAt) < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { $set: { password: hashedPassword } });
    await OTP.deleteMany({ email });

    res.json({ success: true, message: "Password reset successful. Please log in with your new password." });
  } catch (err) {
    console.error("Reset Password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};
