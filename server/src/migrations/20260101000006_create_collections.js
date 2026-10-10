/**
 * Template collections: private, per-user folders for saved templates.
 * - collections          : one folder per user
 * - collection_templates : join allows a template in many collections
 * Run: npm run migrate
 */
exports.up = function up(knex) {
  return knex.schema
    .createTable("collections", (table) => {
      table.increments("id").primary();
      table
        .integer("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("name").notNullable();
      table.timestamps(true, true);
    })
    .createTable("collection_templates", (table) => {
      table.increments("id").primary();
      table
        .integer("collection_id")
        .notNullable()
        .references("id")
        .inTable("collections")
        .onDelete("CASCADE");
      table
        .integer("template_id")
        .notNullable()
        .references("id")
        .inTable("templates")
        .onDelete("CASCADE");
      table.unique(["collection_id", "template_id"]);
      table.timestamps(true, true);
    });
};

exports.down = function down(knex) {
  return knex.schema
    .dropTableIfExists("collection_templates")
    .dropTableIfExists("collections");
};