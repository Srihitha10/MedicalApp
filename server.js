const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware with higher size limits for JSON body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// CORS Middleware with expanded origins
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Enhanced Debug Middleware with more detailed logging
app.use((req, res, next) => {
  console.log(`\n🔥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log("📋 Request headers:", JSON.stringify(req.headers, null, 2));
  console.log("📦 Request body:", JSON.stringify(req.body, null, 2));

  // Capture and log the response
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`📤 Response status: ${res.statusCode}`);
    console.log(
      `📤 Response body: ${
        typeof data === "object" ? JSON.stringify(data, null, 2) : data
      }`,
    );
    return originalSend.apply(this, arguments);
  };

  next();
});

// Connect to MongoDB with enhanced feedback
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    console.log(`📊 Connected to database: ${mongoose.connection.name}`);
    console.log(`🔌 Connection URI: ${process.env.MONGODB_URI.split("@")[1]}`); // Show only part after credentials
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    console.error("🔍 Check your MONGODB_URI in .env file");
  });

// API Routes
app.use("/api/records", require("./src/routes/records"));
app.use("/api/users", require("./src/routes/users"));
app.use("/api/ipfs", require("./src/routes/ipfs")); // MAKE SURE THIS LINE EXISTS
app.use("/api/access", require("./src/routes/access"));

// Test route to verify server is working
app.get("/", (req, res) => {
  res.json({ message: "API server is running!" });
});

// Error Handling with more details
app.use((err, req, res, next) => {
  console.error("⚠️ Error:", err.stack);
  console.error("🔍 Error details:", err);
  console.error("📍 Request path:", req.path);
  console.error("📦 Request body:", req.body);
  res.status(500).json({ error: err.message || "Internal server error!" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}`);
  console.log(`⏰ Server started at: ${new Date().toISOString()}`);
});
