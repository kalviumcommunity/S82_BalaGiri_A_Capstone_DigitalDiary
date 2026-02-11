const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const diaryRoutes = require('./routes/diaryRoutes');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(require('cookie-parser')());
app.use(
  require('helmet').contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // Strict! No inline scripts.
      styleSrc: ["'self'", "'unsafe-inline'"], // React often needs inline styles
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
    },
  })
);




const path = require('path');
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // REMOVED: Secure Access Only

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/diary', diaryRoutes); // load diary routes only once

app.get('/', (req, res) => {
  res.send('API is running');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    // Bind to 0.0.0.0 to listen on all interfaces (fixes some localhost issues)
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("MongoDB Connection Error:", err));

// Global handlers for uncaught exceptions to prevent silent exits
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});