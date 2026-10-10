const knex = require("knex")({
  client: "sqlite3",
  connection: { filename: "./data.sqlite3" },
  useNullAsDefault: true,
});

module.exports = knex;
