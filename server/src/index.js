require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

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

const knex = require("./db");

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

// Serve static files from the built React app
const distPath = path.resolve(__dirname, "../../client/dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// SPA fallback for non-API GET requests
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api")) {
    return next();
  }
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return next();
});

/* API 404 handler */
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

/* Non-API 404 handler */
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

/**
 * One-time, idempotent seed guarded by SEED_ON_START.
 * Runs only when explicitly enabled and only if the templates table is empty,
 * so it never overwrites existing data and is safe to leave enabled.
 */
async function autoSeedIfRequested() {
  if (process.env.SEED_ON_START !== "true") return;
  try {
    const row = await knex("templates").count({ total: "*" }).first();
    const count = Number(row?.total) || 0;
    if (count > 0) {
      console.log(`[seed] ${count} templates present - skipping auto-seed`);
      return;
    }
    const { seed } = require("./seeds/templates");
    await seed(knex);
    console.log("[seed] auto-seed complete");
  } catch (err) {
    console.error("[seed] auto-seed failed (continuing):", err);
  }
}

const PORT = process.env.PORT || 5000;
autoSeedIfRequested().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
