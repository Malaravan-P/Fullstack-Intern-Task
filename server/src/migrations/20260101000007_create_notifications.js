/**
 * In-app notifications + per-type delivery preferences.
 * - notifications                  : one row per event (welcome, approval, ...)
 * - user_notification_preferences  : which event types the user wants to receive
 * Run: npm run migrate
 */
exports.up = function up(knex) {
  return knex.schema
    .createTable("notifications", (table) => {
      table.increments("id").primary();
      table
        .integer("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("type").notNullable();
      table.string("title").notNullable();
      table.text("body");
      table.string("link");
      table.boolean("read").notNullable().defaultTo(false);
      table.timestamps(true, true);
    })
    .createTable("user_notification_preferences", (table) => {
      table
        .integer("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.boolean("welcome").notNullable().defaultTo(true);
      table.boolean("template_approval").notNullable().defaultTo(true);
      table.timestamps(true, true);
      table.primary(["user_id"]);
    });
};

exports.down = function down(knex) {
  return knex.schema
    .dropTableIfExists("user_notification_preferences")
    .dropTableIfExists("notifications");
};