/**
 * Feedback routes: public visitors can submit feedback from the footer popup.
 */
const express = require("express");
const knex = require("../db");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* POST /api/feedback — store a feedback message */
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    const errors = {};

    if (!message || typeof message !== "string" || !message.trim()) {
      errors.message = "A message is required.";
    } else if (message.trim().length > 1000) {
      errors.message = "Message must be 1000 characters or fewer.";
    }
    if (email && (!EMAIL_RE.test(String(email).trim()))) {
      errors.email = "A valid email is required.";
    }
    if (name && name.trim().length > 80) {
      errors.name = "Name must be 80 characters or fewer.";
    }
    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, errors, message: "Validation failed." });
    }

    const [feedback] = await knex("feedback")
      .insert({
        name: name ? String(name).trim() : null,
        email: email ? String(email).trim().toLowerCase() : null,
        message: String(message).trim(),
      })
      .returning(["id", "name", "email", "message", "created_at"]);

    return res.status(201).json({
      success: true,
      message: "Thanks! We read every message.",
      feedback,
    });
  } catch (err) {
    console.error("feedback error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;