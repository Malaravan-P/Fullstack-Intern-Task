const hasDatabaseUrl = !!(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());

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
