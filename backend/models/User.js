const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // removes extra spaces
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true // normalize email
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // basic validation
  },
  age: {
    type: Number,
    default: null // optional
  },
  phone: {
    type: String,
    default: "" // optional
  },
  verified: {
    type: Boolean,
    default: false // ✅ new field for OTP verification
  }
}, { timestamps: true }); // adds createdAt & updatedAt automatically

module.exports = mongoose.model('User', userSchema);
