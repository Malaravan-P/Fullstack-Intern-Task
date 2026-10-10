/**
 * Create tables: users, templates, favorites.
 * Run: npm run migrate
 */
exports.up = function up(knex) {
  return knex.schema
    .createTable("users", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("email").notNullable().unique();
      table.string("password_hash").notNullable();
      table.timestamps(true, true);
    })
    .createTable("templates", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("description").notNullable();
      table.string("thumbnail_url").notNullable();
      table.string("category").notNullable();
      table.timestamps(true, true);
    })
    .createTable("favorites", (table) => {
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
      table.unique(["user_id", "template_id"]);
      table.timestamps(true, true);
    });
};

exports.down = function down(knex) {
  return knex.schema
    .dropTableIfExists("favorites")
    .dropTableIfExists("templates")
    .dropTableIfExists("users");
};
