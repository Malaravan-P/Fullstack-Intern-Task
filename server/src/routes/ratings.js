/**
 * Ratings routes.
 * GET    /api/ratings/:templateId — public aggregate (avg/count + your score if authed)
 * POST   /api/ratings/:templateId — set your score 1-5 (auth required, upsert)
 */
const express = require("express");
const jwt = require("jsonwebtoken");
const knex = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

/* Public route, but picks up a token if present (to include "my_score"). */
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      /* ignore invalid token — treat as guest */
    }
  }
  next();
}

async function aggregate(templateId, userId) {
  const agg = await knex("ratings")
    .where({ template_id: templateId })
    .select()
    .avg({ avg_score: "score" })
    .count({ rating_count: "*" })
    .first();

  let my_score = null;
  if (userId) {
    const mine = await knex("ratings")
      .where({ template_id: templateId, user_id: userId })
      .first();
    my_score = mine ? mine.score : null;
  }

  return {
    avg_rating: Math.round(Number(agg?.avg_score || 0) * 10) / 10,
    rating_count: Number(agg?.rating_count) || 0,
    my_score,
  };
}

/* GET /api/ratings/:templateId */
router.get("/:templateId", optionalAuth, async (req, res) => {
  try {
    const templateId = Number(req.params.templateId);
    if (!Number.isInteger(templateId) || templateId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid template id." });
    }
    const template = await knex("templates").where({ id: templateId }).first();
    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found." });
    }

    const stats = await aggregate(templateId, req.user?.id);
    return res.json({ success: true, ...stats });
  } catch (err) {
    console.error("get ratings error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* POST /api/ratings/:templateId — upsert the user's score */
router.post("/:templateId", auth, async (req, res) => {
  try {
    const templateId = Number(req.params.templateId);
    const score = Number(req.body?.score);
    if (!Number.isInteger(templateId) || templateId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid template id." });
    }
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: "Score must be an integer between 1 and 5.",
      });
    }

    const template = await knex("templates").where({ id: templateId }).first();
    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found." });
    }

    const existing = await knex("ratings")
      .where({ user_id: req.user.id, template_id: templateId })
      .first();

    if (existing) {
      await knex("ratings").where({ id: existing.id }).update({ score });
    } else {
      await knex("ratings").insert({
        user_id: req.user.id,
        template_id: templateId,
        score,
      });
    }

    const stats = await aggregate(templateId, req.user.id);
    return res.json({
      success: true,
      message: existing ? "Rating updated." : "Rating saved.",
      ...stats,
    });
  } catch (err) {
    console.error("set rating error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
