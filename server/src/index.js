/**
 * Express app entry point.
 * Routes: /api/auth, /api/templates, /api/favorites
 * Run: npm run dev (or npm start)
 */
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const templateRoutes = require("./routes/templates");
const favoriteRoutes = require("./routes/favorites");
const ratingRoutes = require("./routes/ratings");
const feedbackRoutes = require("./routes/feedback");
const submissionRoutes = require("./routes/submissions");
const adminRoutes = require("./routes/admin");
const notificationRoutes = require("./routes/notifications");
const collectionRoutes = require("./routes/collections");
const meRoutes = require("./routes/me");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin/submissions", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/me", meRoutes);

/* 404 handler */
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

/* Central error handler */
app.use((err, req, res, next) => {
  console.error("unhandled error:", err);
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON body." });
  }
  res.status(500).json({ success: false, message: "Internal server error." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
