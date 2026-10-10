/**
 * Personal data routes (auth required).
 * - GET /api/me/ratings — the current user's reviews (with template info)
 */
const express = require("express");
const knex = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

/* GET /api/me/ratings */
router.get("/ratings", async (req, res) => {
  try {
    const ratings = await knex("ratings")
      .join("templates", "ratings.template_id", "templates.id")
      .where("ratings.user_id", req.user.id)
      .select(
        "ratings.id as rating_id",
        "ratings.score",
        "ratings.updated_at",
        "templates.id as template_id",
        "templates.name",
        "templates.thumbnail_url",
        "templates.category"
      )
      .orderBy("ratings.updated_at", "desc");

    return res.json({ success: true, ratings });
  } catch (err) {
    console.error("my ratings error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;