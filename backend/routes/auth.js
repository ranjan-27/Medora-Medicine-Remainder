const express = require('express');
const { signup, login, sendOtp, verifyOtp, profile, updateProfile, forgotPassword, resetPassword } = require("../controllers/authController");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// OTP routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Protected routes
router.get("/profile", authMiddleware, profile);
router.put("/update-profile", authMiddleware, updateProfile);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


module.exports = router;


