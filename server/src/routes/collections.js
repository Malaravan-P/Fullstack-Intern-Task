/**
 * Template collections (private, per-user).
 * - GET    /api/collections                         — list with counts + cover thumbs
 * - POST   /api/collections {name}                  — create
 * - GET    /api/collections/:id                     — collection + its templates
 * - PATCH  /api/collections/:id {name}              — rename
 * - DELETE /api/collections/:id                     — delete
 * - POST   /api/collections/:id/templates {template_id}   — add template
 * - DELETE /api/collections/:id/templates/:templateId     — remove template
 */
const express = require("express");
const knex = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

const LIST_FIELDS = [
  "templates.id",
  "templates.name",
  "templates.thumbnail_url",
  "templates.category",
  "templates.status",
];

function validName(name) {
  return typeof name === "string" && name.trim().length >= 1 && name.trim().length <= 60;
}

async function getOwned(id, userId) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return knex("collections").where({ id: parsed, user_id: userId }).first();
}

/* GET /api/collections?template_id= — include `has` flag per collection */
router.get("/", async (req, res) => {
  try {
    const collections = await knex("collections")
      .where({ user_id: req.user.id })
      .orderBy("id", "desc");

    const templateId = Number(req.query.template_id);
    let hasSet = new Set();
    if (Number.isInteger(templateId) && templateId > 0) {
      const rows = await knex("collection_templates")
        .join("collections", "collection_templates.collection_id", "collections.id")
        .where("collections.user_id", req.user.id)
        .where("collection_templates.template_id", templateId)
        .select("collection_templates.collection_id");
      hasSet = new Set(rows.map((r) => r.collection_id));
    }

    const links = await knex("collection_templates")
      .join("templates", "collection_templates.template_id", "templates.id")
      .whereIn(
        "collection_id",
        collections.map((c) => c.id)
      )
      .where("templates.status", "approved")
      .select(
        "collection_templates.collection_id",
        "collection_templates.id as link_order",
        ...LIST_FIELDS
      )
      .orderBy("collection_templates.id", "asc");

    const byCollection = new Map();
    for (const link of links) {
      if (!byCollection.has(link.collection_id)) byCollection.set(link.collection_id, []);
      byCollection.get(link.collection_id).push(link);
    }

    const result = collections.map((c) => {
      const members = byCollection.get(c.id) || [];
      return {
        id: c.id,
        name: c.name,
        template_count: members.length,
        has: hasSet.has(c.id),
        covers: members.slice(-3).map((m) => ({
          template_id: m.id,
          thumbnail_url: m.thumbnail_url,
          name: m.name,
          category: m.category,
        })),
        created_at: c.created_at,
        updated_at: c.updated_at,
      };
    });

    return res.json({ success: true, collections: result });
  } catch (err) {
    console.error("list collections error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* POST /api/collections */
router.post("/", async (req, res) => {
  try {
    if (!validName(req.body?.name)) {
      return res.status(400).json({
        success: false,
        message: "Collection name must be 1–60 characters.",
      });
    }
    const [collection] = await knex("collections")
      .insert({ user_id: req.user.id, name: req.body.name.trim() })
      .returning(["id", "user_id", "name", "created_at", "updated_at"]);
    return res.status(201).json({
      success: true,
      message: "Collection created.",
      collection: { ...collection, template_count: 0, covers: [] },
    });
  } catch (err) {
    console.error("create collection error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* GET /api/collections/:id */
router.get("/:id", async (req, res) => {
  try {
    const collection = await getOwned(req.params.id, req.user.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found." });
    }

    const links = await knex("collection_templates")
      .join("templates", "collection_templates.template_id", "templates.id")
      .where("collection_templates.collection_id", collection.id)
      .where("templates.status", "approved")
      .select("templates.id", "templates.name", "templates.description", "templates.thumbnail_url", "templates.category", "templates.created_at", "templates.updated_at")
      .orderBy("collection_templates.id", "desc");

    return res.json({ success: true, collection: { ...collection, templates: links } });
  } catch (err) {
    console.error("get collection error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* PATCH /api/collections/:id */
router.patch("/:id", async (req, res) => {
  try {
    const collection = await getOwned(req.params.id, req.user.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found." });
    }
    if (!validName(req.body?.name)) {
      return res.status(400).json({
        success: false,
        message: "Collection name must be 1–60 characters.",
      });
    }
    const [updated] = await knex("collections")
      .where({ id: collection.id })
      .update({ name: req.body.name.trim() })
      .returning(["id", "name", "created_at", "updated_at"]);
    return res.json({ success: true, message: "Collection renamed.", collection: updated });
  } catch (err) {
    console.error("rename collection error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* DELETE /api/collections/:id */
router.delete("/:id", async (req, res) => {
  try {
    const collection = await getOwned(req.params.id, req.user.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found." });
    }
    await knex("collections").where({ id: collection.id }).del();
    return res.json({ success: true, message: "Collection deleted." });
  } catch (err) {
    console.error("delete collection error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* POST /api/collections/:id/templates — add a template */
router.post("/:id/templates", async (req, res) => {
  try {
    const collection = await getOwned(req.params.id, req.user.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found." });
    }

    const templateId = Number(req.body?.template_id);
    if (!Number.isInteger(templateId) || templateId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid template id." });
    }
    const template = await knex("templates").where({ id: templateId, status: "approved" }).first();
    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found." });
    }

    const existing = await knex("collection_templates")
      .where({ collection_id: collection.id, template_id: templateId })
      .first();
    if (existing) {
      return res.status(409).json({ success: false, message: "Template is already in this collection." });
    }

    await knex("collection_templates").insert({ collection_id: collection.id, template_id: templateId });
    return res.status(201).json({
      success: true,
      message: "Added to collection.",
      collection_id: collection.id,
      template_id: templateId,
    });
  } catch (err) {
    console.error("add to collection error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/* DELETE /api/collections/:id/templates/:templateId */
router.delete("/:id/templates/:templateId", async (req, res) => {
  try {
    const collection = await getOwned(req.params.id, req.user.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found." });
    }
    const templateId = Number(req.params.templateId);
    if (!Number.isInteger(templateId) || templateId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid template id." });
    }
    const removed = await knex("collection_templates")
      .where({ collection_id: collection.id, template_id: templateId })
      .del();
    if (!removed) {
      return res.status(404).json({ success: false, message: "Template is not in this collection." });
    }
    return res.json({
      success: true,
      message: "Removed from collection.",
      collection_id: collection.id,
      template_id: templateId,
    });
  } catch (err) {
    console.error("remove from collection error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;