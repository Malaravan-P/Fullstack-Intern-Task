/**
 * Ratings: one score (1-5) per user per template.
 * Run: npm run migrate
 */
exports.up = function up(knex) {
  return knex.schema.createTable("ratings", (table) => {
    table.increments("id").primary();
    table
      .integer("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .integer("template_id")
      .notNullable()
      .references("id")
      .inTable("templates")
      .onDelete("CASCADE");
    table.integer("score").notNullable();
    table.unique(["user_id", "template_id"]);
    table.timestamps(true, true);
  });
};

exports.down = function down(knex) {
  return knex.schema.dropTableIfExists("ratings");
};
