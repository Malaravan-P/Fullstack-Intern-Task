/**
 * Add user roles and template submission/review fields.
 * - users.role            : 'user' | 'admin' (default 'user')
 * - templates.author_id   : owning user (null for store-seeded templates)
 * - templates.status      : 'pending' | 'approved' | 'rejected' (default 'approved')
 * - templates.rejection_reason : text, set when an admin rejects a submission
 * Run: npm run migrate
 */
exports.up = function up(knex) {
  return knex.schema
    .table("users", (table) => {
      table.string("role").notNullable().defaultTo("user");
    })
    .table("templates", (table) => {
      table
        .integer("author_id")
        .nullable()
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");
      table.string("status").notNullable().defaultTo("approved");
      table.text("rejection_reason");
    });
};

exports.down = function down(knex) {
  return knex.schema
    .table("templates", (table) => {
      table.dropColumn("rejection_reason");
      table.dropColumn("status");
      table.dropColumn("author_id");
    })
    .table("users", (table) => {
      table.dropColumn("role");
    });
};