/**
 * Knex configuration.
 * Uses PostgreSQL if DATABASE_URL is set; otherwise falls back to SQLite locally.
 */
const hasDatabaseUrl = !!(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());

module.exports = {
  client: hasDatabaseUrl ? "pg" : "sqlite3",
  connection: hasDatabaseUrl
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : { filename: "./data.sqlite3" },
  useNullAsDefault: !hasDatabaseUrl,
  migrations: { directory: "./src/migrations" },
  seeds: { directory: "./src/seeds" },
};
