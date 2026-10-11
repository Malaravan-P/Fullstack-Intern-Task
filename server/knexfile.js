/**
 * Knex configuration.
 * Uses PostgreSQL in production (when DATABASE_URL is set), falls back to SQLite locally.
 */
const isProd = process.env.NODE_ENV === "production" || !!process.env.DATABASE_URL;

module.exports = {
  client: isProd ? "pg" : "sqlite3",
  connection: isProd
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : { filename: "./data.sqlite3" },
  useNullAsDefault: !isProd,
  migrations: { directory: "./src/migrations" },
  seeds: { directory: "./src/seeds" },
};
