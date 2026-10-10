/**
 * Template submission routes (authenticated developer → pending review).
 * - POST      /api/submissions                — create a submission (status pending)
 * - GET       /api/submissions                — my submissions
 * - GET       /api/submissions/:id            — one of my submissions
 * - PATCH     /api/submissions/:id            — update while pending
 * - DELETE    /api/submissions/:id            — delete while pending
 *
 * Approved templates become publicly visible through /api/templates; pending
 * and rejected ones are never exposed through the public listing.
 */
const express = require("express");
const knex = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

const HTML_RE = /<html[\s>]/i;

const SUBMISSION_FIELDS = [
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

function validateSubmissionInput(body) {
  const { name, description, category, thumbnail_url, preview_html } = body || {};
  const errors = {};
  if (!name || typeof name !== "string" || name.trim().length < 3 || name.trim().length > 80) {
    errors.name = "Title is required (3–80 characters).";
  }
  if (!description || typeof description !== "string") {
    errors.description = "Description is required.";
  }
  if (!category || typeof category !== "string" || category.trim().length < 2 || category.trim().length > 40) {
    errors.category = "Category is required (2–40 characters).";
  }
  if (thumbnail_url && typeof thumbnail_url !== "string") {
    errors.thumbnail_url = "Thumbnail URL is invalid.";
  }
  if (!preview_html || typeof preview_html !== "string" || !HTML_RE.test(preview_html)) {
    errors.preview_html = "Preview HTML is required and must be a full HTML document.";
  }
  return errors;
}

/* GET /api/submissions — list my submissions */
router.get("/", auth, async (req, res) => {
  try {
    const submissions = await knex("templates")
      .where({ author_id: req.user.id })
      .select(...SUBMISSION_FIELDS)
      .orderBy("id", "desc");
    return res.json({ success: true, submissions });
  } catch (err) {
    console.error("list submissions error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* POST /api/submissions — create a pending submission */
router.post("/", auth, async (req, res) => {
  try {
    const errors = validateSubmissionInput(req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, message: "Validation failed.", errors });
    }

    const { name, description, category, thumbnail_url, preview_html } = req.body;
    const [submission] = await knex("templates")
      .insert({
        author_id: req.user.id,
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        thumbnail_url: thumbnail_url && String(thumbnail_url).trim() ? String(thumbnail_url).trim() : "",
        preview_html,
        status: "pending",
      })
      .returning(SUBMISSION_FIELDS);

    return res.status(201).json({
      success: true,
      message: "Submission received. An admin will review it shortly.",
      submission,
    });
  } catch (err) {
    console.error("create submission error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* Private lookup scoped to the owner. */
async function findOwned(id, userId) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return knex("templates").where({ id: parsed, author_id: userId }).first();
}

/* GET /api/submissions/:id */
router.get("/:id", auth, async (req, res) => {
  try {
    const submission = await findOwned(req.params.id, req.user.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }
    return res.json({ success: true, submission });
  } catch (err) {
    console.error("get submission error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* PATCH /api/submissions/:id — edit only while pending */
router.patch("/:id", auth, async (req, res) => {
  try {
    const submission = await findOwned(req.params.id, req.user.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }
    if (submission.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Only pending submissions can be edited.",
      });
    }

    const merged = {
      name: submission.name,
      description: submission.description,
      category: submission.category,
      thumbnail_url: submission.thumbnail_url,
      preview_html: submission.preview_html,
      ...req.body,
    };
    const errors = validateSubmissionInput(merged);
    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, message: "Validation failed.", errors });
    }

    const allowed = ["name", "description", "category", "thumbnail_url", "preview_html"];
    const patch = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        patch[key] = typeof req.body[key] === "string" ? req.body[key].trim() : req.body[key];
      }
    }

    const [updated] = await knex("templates")
      .where({ id: submission.id })
      .update(patch)
      .returning(SUBMISSION_FIELDS);

    return res.json({ success: true, message: "Submission updated.", submission: updated });
  } catch (err) {
    console.error("update submission error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* DELETE /api/submissions/:id — delete only while pending */
router.delete("/:id", auth, async (req, res) => {
  try {
    const submission = await findOwned(req.params.id, req.user.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }
    if (submission.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Only pending submissions can be deleted.",
      });
    }
    await knex("templates").where({ id: submission.id }).del();
    return res.json({ success: true, message: "Submission deleted." });
  } catch (err) {
    console.error("delete submission error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;