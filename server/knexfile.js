/**
 * Knex configuration. Points knex CLI at the migrations/seeds folders
 * and the SQLite database file.
 */
module.exports = {
  client: "sqlite3",
  connection: { filename: "./data.sqlite3" },
  useNullAsDefault: true,
  migrations: { directory: "./src/migrations" },
  seeds: { directory: "./src/seeds" },
};
