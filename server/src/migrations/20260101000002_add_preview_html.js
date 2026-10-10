/**
 * Live preview: store a self-contained HTML document per template so the
 * frontend can render "how the template will look" in a sandboxed iframe.
 * Run: npm run migrate
 */
exports.up = function up(knex) {
  return knex.schema.table("templates", (table) => {
    table.text("preview_html");
  });
};

exports.down = function down(knex) {
  return knex.schema.table("templates", (table) => {
    table.dropColumn("preview_html");
  });
};
