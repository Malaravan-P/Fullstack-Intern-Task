const hasDatabaseUrl = !!(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());

if (hasDatabaseUrl) {
  console.log("[db] using PostgreSQL (DATABASE_URL set)");
} else {
  console.log("[db] using SQLite (./data.sqlite3)");
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[db] WARNING: production without DATABASE_URL - falling back to ephemeral SQLite. Data will not persist across restarts or deploys."
    );
  }
}

const knex = require("knex")({
  client: hasDatabaseUrl ? "pg" : "sqlite3",
  connection: hasDatabaseUrl
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : { filename: "./data.sqlite3" },
  useNullAsDefault: !hasDatabaseUrl,
});

module.exports = knex;
