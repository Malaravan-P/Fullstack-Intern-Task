/**
 * Admin guard. Requires the request to already be authenticated (auth
 * middleware first) and the token's role to be 'admin'.
 */
module.exports = function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required." });
  }
  return next();
};