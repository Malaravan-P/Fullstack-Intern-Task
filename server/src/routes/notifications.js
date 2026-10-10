/**
 * In-app notification routes (auth required).
 * - GET            /api/notifications           — list + unread count
 * - PATCH          /api/notifications/read      — mark read { ids?: [], all?: true }
 * - GET            /api/notifications/preferences — delivery preferences
 * - PUT            /api/notifications/preferences — update preferences
 */
const express = require("express");
const knex = require("../db");
const auth = require("../middleware/auth");
const notifications = require("../services/notifications");

const router = express.Router();

router.use(auth);

const PREF_KEYS = ["welcome", "template_approval"];

/* GET /api/notifications */
router.get("/", async (req, res) => {
  try {
    const rows = await knex("notifications")
      .where({ user_id: req.user.id })
      .orderBy("id", "desc")
      .limit(50);
    const unread = await knex("notifications")
      .where({ user_id: req.user.id, read: false })
      .count({ total: "*" })
      .first();
    return res.json({
      success: true,
      unread: Number(unread?.total) || 0,
      notifications: rows,
    });
  } catch (err) {
    console.error("list notifications error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* PATCH /api/notifications/read */
router.patch("/read", async (req, res) => {
  try {
    const { ids, all } = req.body || {};
    let query = knex("notifications").where({ user_id: req.user.id });
    if (!all) {
      const list = Array.isArray(ids) ? ids.map(Number).filter(Number.isInteger) : [];
      if (!list.length) {
        return res.status(400).json({ success: false, message: "Provide ids or all: true." });
      }
      query = query.whereIn("id", list);
    }
    await query.update({ read: true });

    const unread = await knex("notifications")
      .where({ user_id: req.user.id, read: false })
      .count({ total: "*" })
      .first();
    return res.json({ success: true, unread: Number(unread?.total) || 0 });
  } catch (err) {
    console.error("mark read error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* GET /api/notifications/preferences */
router.get("/preferences", async (req, res) => {
  try {
    const p = await notifications.prefs(req.user.id);
    const { user_id, created_at, updated_at, ...prefs } = p;
    return res.json({ success: true, prefs });
  } catch (err) {
    console.error("get preferences error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* PUT /api/notifications/preferences */
router.put("/preferences", async (req, res) => {
  try {
    const body = req.body || {};
    const updates = {};
    for (const key of PREF_KEYS) {
      if (typeof body[key] === "boolean") updates[key] = body[key];
    }
    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, message: "No valid preference provided." });
    }

    await notifications.prefs(req.user.id); // ensure the row exists
    await knex("user_notification_preferences").where({ user_id: req.user.id }).update(updates);
    const p = await notifications.prefs(req.user.id);
    const { user_id, created_at, updated_at, ...prefs } = p;
    return res.json({ success: true, prefs });
  } catch (err) {
    console.error("update preferences error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;