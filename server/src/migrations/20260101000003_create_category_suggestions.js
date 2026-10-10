/**
 * Category suggestions: users can request a new category and upvote others.
 * Votes surface community interest so the catalog can grow accordingly.
 * Run: npm run migrate
 */
exports.up = function up(knex) {
  return knex.schema.createTable("category_suggestions", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable().unique();
    table.integer("votes").notNullable().defaultTo(0);
    table.timestamps(true, true);
  });
};

exports.down = function down(knex) {
  return knex.schema.dropTableIfExists("category_suggestions");
};