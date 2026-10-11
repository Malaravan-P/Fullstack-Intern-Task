const isProd = process.env.NODE_ENV === "production" || !!process.env.DATABASE_URL;

const knex = require("knex")({
  client: isProd ? "pg" : "sqlite3",
  connection: isProd
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : { filename: "./data.sqlite3" },
  useNullAsDefault: !isProd,
});

module.exports = knex;
