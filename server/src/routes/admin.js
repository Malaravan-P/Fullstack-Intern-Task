/**
 * Admin review routes for template submissions.
 * - GET   /api/admin/submissions?status=pending  — list (light, no preview_html)
 * - GET   /api/admin/submissions/:id             — one submission with preview_html
 * - PATCH /api/admin/submissions/:id             — approve / reject (with reason)
 */
const express = require("express");
const knex = require("../db");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const notifications = require("../services/notifications");

const router = express.Router();

router.use(auth, requireAdmin);

const LIST_FIELDS = [
  "id",
  "author_id",
  "name",
  "description",
  "thumbnail_url",
  "category",
  "status",
  "rejection_reason",
  "created_at",
  "updated_at",
];

/* GET /api/admin/submissions?status= */
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    // Only developer submissions (author_id set) live here, not store-seeded rows.
    let query = knex("templates")
      .leftJoin("users", "templates.author_id", "users.id")
      .whereNotNull("templates.author_id")
      .select(
        "templates.id",
        "templates.author_id",
        "templates.name",
        "templates.description",
        "templates.thumbnail_url",
        "templates.category",
        "templates.status",
        "templates.rejection_reason",
        "templates.created_at",
        "templates.updated_at",
        "users.name as author_name"
      )
      .orderBy("templates.id", "desc");

    if (status && ["pending", "approved", "rejected"].includes(String(status))) {
      query = query.where({ status: String(status) });
    }

    const submissions = await query;
    return res.json({ success: true, submissions });
  } catch (err) {
    console.error("list admin submissions error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* GET /api/admin/submissions/:id */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid id." });
    }
    const submission = await knex("templates")
      .leftJoin("users", "templates.author_id", "users.id")
      .select("templates.*", "users.name as author_name")
      .where("templates.id", id)
      .first();
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }
    return res.json({ success: true, submission });
  } catch (err) {
    console.error("get admin submission error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* PATCH /api/admin/submissions/:id — approve or reject */
router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid id." });
    }

    const { status } = req.body || {};
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be pending, approved, or rejected.",
      });
    }

    const submission = await knex("templates").where({ id }).first();
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }

    const updates = { status };
    if (status === "approved") {
      updates.rejection_reason = null;
    } else if (status === "rejected") {
      const reason = String(req.body?.rejection_reason || "").trim();
      updates.rejection_reason = reason || "Did not meet marketplace standards.";
    } else {
      updates.rejection_reason = null;
    }

    const [updated] = await knex("templates")
      .where({ id })
      .update(updates)
      .returning(LIST_FIELDS);

    // Notify the author when their submission is approved.
    if (status === "approved" && submission.author_id) {
      try {
        await notifications.create(
          submission.author_id,
          "template_approval",
          "Your template was approved 🎉",
          `"${submission.name}" is now live in the marketplace.`,
          `/templates`
        );
      } catch (err) {
        console.error("approval notification error:", err);
      }
    }

    return res.json({
      success: true,
      message: status === "approved" ? "Submission approved and published." : "Submission rejected.",
      submission: updated,
    });
  } catch (err) {
    console.error("review submission error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;