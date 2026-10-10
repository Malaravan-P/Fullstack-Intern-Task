/**
 * Feedback: visitors can send feedback from the footer popup.
 * Messages are stored so they can be reviewed later.
 * Run: npm run migrate
 */
exports.up = function up(knex) {
  return knex.schema.createTable("feedback", (table) => {
    table.increments("id").primary();
    table.string("name");
    table.string("email");
    table.text("message").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function down(knex) {
  return knex.schema.dropTableIfExists("feedback");
};