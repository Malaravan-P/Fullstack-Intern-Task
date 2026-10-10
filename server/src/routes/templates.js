/**
 * Templates routes.
 * GET /api/templates              — list (supports ?search, ?category, ?sort, ?page, ?limit)
 * GET /api/templates/categories   — distinct categories for filters
 * GET /api/templates/:id          — single template details
 *
 * Every returned template includes avg_rating + rating_count.
 */
const express = require("express");
const knex = require("../db");

const router = express.Router();

/* Attach rating aggregates to an array of templates. */
async function withRatings(templates) {
  const aggs = await knex("ratings")
    .select("template_id")
    .avg({ avg_score: "score" })
    .count({ rating_count: "*" })
    .groupBy("template_id");

  const map = new Map(
    aggs.map((a) => [
      a.template_id,
      {
        avg_rating: Math.round(Number(a.avg_score) * 10) / 10 || 0,
        rating_count: Number(a.rating_count) || 0,
      },
    ])
  );

  return templates.map((t) => ({
    ...t,
    avg_rating: map.get(t.id)?.avg_rating ?? 0,
    rating_count: map.get(t.id)?.rating_count ?? 0,
  }));
}

/* GET /api/templates */
router.get("/", async (req, res) => {
  try {
    const { search, category, sort, page, limit } = req.query;

    let query = knex("templates");
    // Only approved templates are public; pending/rejected submissions stay hidden.
    query.where("status", "approved");

    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      query
        .where((b) =>
          b.where("name", "like", term).orWhere("description", "like", term)
        );
    }
    if (category && String(category).trim()) {
      query.where("category", String(category).trim());
    }

    if (sort === "newest") query.orderBy("created_at", "desc").orderBy("id", "desc");
    else if (sort === "oldest") query.orderBy("created_at", "asc").orderBy("id", "asc");
    else if (sort === "name") query.orderBy("name", "asc");
    else query.orderBy("id");

    // Total count (before pagination) for load-more UI.
    const totalRow = await query.clone().count({ total: "*" }).first();
    const total = Number(totalRow?.total) || 0;

    const pageNum = Math.max(1, Number(page) || 1);
    const rawLimit = Number(limit);
    const limitNum =
      Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(50, Math.floor(rawLimit))
        : 0;
    if (limitNum) query.offset((pageNum - 1) * limitNum).limit(limitNum);

    // List view omits preview_html to keep paged responses small; the detail
    // route returns it for the live preview.
    const templates = await query.select(
      "id",
      "name",
      "description",
      "thumbnail_url",
      "category",
      "created_at",
      "updated_at"
    );
    const withAvg = await withRatings(templates);

    return res.json({
      success: true,
      templates: withAvg,
      total,
      ...(limitNum ? { page: pageNum, limit: limitNum } : {}),
    });
  } catch (err) {
    console.error("list templates error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* GET /api/templates/categories — must stay above /:id */
router.get("/categories", async (req, res) => {
  try {
    const rows = await knex("templates")
      .where({ status: "approved" })
      .distinct("category")
      .orderBy("category");
    return res.json({
      success: true,
      categories: rows.map((r) => r.category),
    });
  } catch (err) {
    console.error("list categories error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* GET /api/templates/categories/suggest — all requested categories, by votes */
router.get("/categories/suggest", async (req, res) => {
  try {
    const suggestions = await knex("category_suggestions")
      .select("id", "name", "votes", "created_at")
      .orderBy("votes", "desc")
      .orderBy("id", "asc");
    return res.json({ success: true, suggestions });
  } catch (err) {
    console.error("list suggestions error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* POST /api/templates/categories/suggest — request a new category */
router.post("/categories/suggest", async (req, res) => {
  try {
    const raw = String(req.body?.name || "").trim();
    if (raw.length < 2 || raw.length > 40) {
      return res.status(400).json({
        success: false,
        message: "Category name must be 2–40 characters.",
      });
    }

    const normalized = raw.toLowerCase();
    const existing = await knex("category_suggestions")
      .whereRaw("lower(name) = ?", [normalized])
      .first();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "That category has already been requested.",
        suggestion: existing,
      });
    }

    const [suggestion] = await knex("category_suggestions")
      .insert({ name: raw, votes: 0 })
      .returning(["id", "name", "votes", "created_at"]);

    return res.status(201).json({
      success: true,
      message: "Category request submitted.",
      suggestion,
    });
  } catch (err) {
    console.error("suggest category error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* POST /api/templates/categories/suggest/:id/vote — upvote a request */
router.post("/categories/suggest/:id/vote", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid suggestion id." });
    }

    const suggestion = await knex("category_suggestions").where({ id }).first();
    if (!suggestion) {
      return res.status(404).json({ success: false, message: "Suggestion not found." });
    }

    const votes = Number(suggestion.votes) + 1;
    await knex("category_suggestions").where({ id }).update({ votes });
    return res.json({
      success: true,
      message: "Vote counted.",
      suggestion: { ...suggestion, votes },
    });
  } catch (err) {
    console.error("vote suggestion error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* GET /api/templates/:id */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid template id." });
    }

    const template = await knex("templates")
      .where({ id, status: "approved" })
      .first();
    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found." });
    }

    const [detailed] = await withRatings([template]);
    return res.json({ success: true, template: detailed });
  } catch (err) {
    console.error("get template error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
