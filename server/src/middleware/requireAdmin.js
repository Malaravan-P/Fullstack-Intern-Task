/**
 * Admin guard. Requires the request to already be authenticated (auth
 * middleware first). The role is read fresh from the database so that
 * recently-promoted users are not blocked by a stale JWT role claim.
 */
const knex = require("../db");

module.exports = async function requireAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ success: false, message: "Admin access required." });
    }
    const user = await knex("users").where({ id: req.user.id }).select("role").first();
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required." });
    }
    req.user.role = user.role;
    return next();
  } catch (err) {
    console.error("requireAdmin error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};