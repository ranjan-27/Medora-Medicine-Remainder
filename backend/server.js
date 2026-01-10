// Load environment variables FIRST before any other imports
const dotenv = require('dotenv');
dotenv.config();

// Now import modules that depend on environment variables
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const medicineRoutes = require('./routes/medicine');
const transporter = require('./config/emailConfig');
const contactRoutes = require("./routes/contact");
// backend/app.js or backend/server.js
const notificationsRoute = require('./routes/notifications');
const { startAutoMissJob } = require("./jobs/autoMiss");
 
const app = express();

// Connect to MongoDB after dotenv is loaded
connectDB();

app.use(cors());
app.use(express.json());
//const { scheduleMedicineReminders } = require("./jobs/medicineScheduler");
const { agenda } = require("./jobs/agendaScheduler");
startAutoMissJob();
app.use('/api/notifications', notificationsRoute);
app.use('/api/auth', authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/contact", contactRoutes);


app.get('/', (req, res) => {
  res.send('Backend running 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => { 
  console.log(`🚀 Server running on port ${PORT}`);
  // ✅ Start Agenda explicitly (optional, but good practice)
  await agenda.start(); console.log("📅 Agenda started and ready to process jobs"); 
});
