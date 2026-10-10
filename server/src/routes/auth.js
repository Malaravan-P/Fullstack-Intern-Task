/**
 * Authentication routes: register + login.
 * Passwords are hashed with bcrypt; sessions use JWT.
 */
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const knex = require("../db");
const auth = require("../middleware/auth");
const notifications = require("../services/notifications");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || "user" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role || "user",
});

/* PATCH /api/auth/me — rename the current user */
router.patch("/me", auth, async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
      return res.status(400).json({
        success: false,
        message: "Name must be 2–80 characters.",
      });
    }

    const [user] = await knex("users")
      .where({ id: req.user.id })
      .update({ name: name.trim() })
      .returning(["id", "name", "email", "role"]);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.json({
      success: true,
      message: "Name updated.",
      user: publicUser(user),
    });
  } catch (err) {
    console.error("rename error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* GET /api/auth/me — current authenticated user */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await knex("users")
      .where({ id: req.user.id })
      .first();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const favCount = await knex("favorites")
      .where({ user_id: user.id })
      .count({ total: "*" })
      .first();

    return res.json({
      success: true,
      user: {
        ...publicUser(user),
        favorites_count: Number(favCount?.total) || 0,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("me error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* POST /api/auth/register */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    const errors = {};

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.name = "Name is required (min 2 characters).";
    }
    if (!email || !EMAIL_RE.test(String(email).trim())) {
      errors.email = "A valid email is required.";
    }
    if (!password || String(password).length < 6) {
      errors.password = "Password is required (min 6 characters).";
    }
    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, errors, message: "Validation failed." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await knex("users").where({ email: normalizedEmail }).first();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const password_hash = await bcrypt.hash(String(password), 10);
    const [user] = await knex("users")
      .insert({ name: name.trim(), email: normalizedEmail, password_hash })
      .returning(["id", "name", "email", "role"]);

    // Welcome notification (respects the user's preference; defaults on).
    try {
      await notifications.create(
        user.id,
        "welcome",
        "Welcome to Template Store 🎉",
        `Hey ${user.name}! Your account is ready — start exploring templates and building collections.`
      );
    } catch (err) {
      console.error("welcome notification error:", err);
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: publicUser(user),
      token: signToken(user),
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* POST /api/auth/login */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const errors = {};

    if (!email || !EMAIL_RE.test(String(email).trim())) {
      errors.email = "A valid email is required.";
    }
    if (!password) {
      errors.password = "Password is required.";
    }
    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, errors, message: "Validation failed." });
    }

    const user = await knex("users")
      .where({ email: String(email).trim().toLowerCase() })
      .first();

    if (!user || !(await bcrypt.compare(String(password), user.password_hash))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    return res.json({
      success: true,
      message: "Login successful.",
      user: publicUser(user),
      token: signToken(user),
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
