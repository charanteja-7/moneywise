const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/accountRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

dotenv.config(); // Load environment variables

// Connect to the database
connectDB();

const app = express();

// Middleware
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173', // Local development URL
      'https://moneywise-taupe.vercel.app', // Production URL
    ];

    // Allow requests from the frontend URL or allow if there's no origin (like Postman or testing tools)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy does not allow access from this origin'), false);
    }
  },
  credentials: true,
};



app.use(cors(corsOptions));

// Example of handling pre-flight requests
app.options('*', cors(corsOptions)); // Allow pre-flight requests

// Ensure your backend sends appropriate headers for CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins or a specific one
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/accounts", userRoutes);
app.use("/api/transactions", transactionRoutes);

// 404 Handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
