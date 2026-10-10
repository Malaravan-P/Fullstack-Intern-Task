/**
 * In-app notification helpers.
 * - prefs(userId): returns the user's delivery preferences (creates defaults on first use)
 * - create(userId, type, title, body, link): inserts a notification if the user
 *   subscribes to that event type. Returns the row or null when opted out.
 */
const knex = require("../db");

const TYPE_TO_PREF = {
  welcome: "welcome",
  template_approval: "template_approval",
};

async function prefs(userId) {
  let row = await knex("user_notification_preferences").where({ user_id: userId }).first();
  if (!row) {
    await knex("user_notification_preferences").insert({ user_id: userId });
    row = await knex("user_notification_preferences").where({ user_id: userId }).first();
  }
  return row;
}

async function create(userId, type, title, body, link = null) {
  const prefKey = TYPE_TO_PREF[type];
  if (prefKey) {
    const p = await prefs(userId);
    if (!p[prefKey]) return null;
  }

  const [notification] = await knex("notifications")
    .insert({ user_id: userId, type, title, body, link, read: false })
    .returning(["id", "user_id", "type", "title", "body", "link", "read", "created_at"]);
  return notification;
}

module.exports = { prefs, create };