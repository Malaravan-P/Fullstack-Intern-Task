/**
 * Favorites routes (all require authentication).
 * POST   /api/favorites/:templateId — add a template to user's favorites
 * DELETE /api/favorites/:templateId — remove a template from user's favorites
 * GET    /api/favorites             — list user's favorited templates
 */
const express = require("express");
const knex = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

/* POST /api/favorites/:templateId */
router.post("/:templateId", auth, async (req, res) => {
  try {
    const templateId = Number(req.params.templateId);
    if (!Number.isInteger(templateId) || templateId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid template id." });
    }

    const template = await knex("templates").where({ id: templateId }).first();
    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found." });
    }

    const existing = await knex("favorites")
      .where({ user_id: req.user.id, template_id: templateId })
      .first();
    if (existing) {
      return res.status(409).json({ success: false, message: "Template already in favorites." });
    }

    await knex("favorites").insert({ user_id: req.user.id, template_id: templateId });

    return res.status(201).json({
      success: true,
      message: "Template added to favorites.",
      template_id: templateId,
    });
  } catch (err) {
    console.error("add favorite error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* DELETE /api/favorites/:templateId */
router.delete("/:templateId", auth, async (req, res) => {
  try {
    const templateId = Number(req.params.templateId);
    if (!Number.isInteger(templateId) || templateId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid template id." });
    }

    const removed = await knex("favorites")
      .where({ user_id: req.user.id, template_id: templateId })
      .del();

    if (!removed) {
      return res.status(404).json({ success: false, message: "Template is not in your favorites." });
    }

    return res.json({
      success: true,
      message: "Template removed from favorites.",
      template_id: templateId,
    });
  } catch (err) {
    console.error("remove favorite error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* GET /api/favorites */
router.get("/", auth, async (req, res) => {
  try {
    const favorites = await knex("favorites")
      .join("templates", "favorites.template_id", "templates.id")
      .where("favorites.user_id", req.user.id)
      .select("templates.*")
      .orderBy("favorites.id", "desc");

    return res.json({ success: true, favorites });
  } catch (err) {
    console.error("list favorites error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
