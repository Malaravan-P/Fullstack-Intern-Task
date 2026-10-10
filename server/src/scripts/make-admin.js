/**
 * Promote a user to admin by email (or demote back to 'user').
 * Usage: npm run make-admin <email>
 *        npm run make-admin <email> --remove
 */
const knex = require("../db");

async function main() {
  const args = process.argv.slice(2);
  const remove = args.includes("--remove");
  const email = args.find((a) => !a.startsWith("--"));

  if (!email) {
    console.error("Usage: npm run make-admin <email> [--remove]");
    process.exit(1);
  }

  const role = remove ? "user" : "admin";
  const updated = await knex("users").where({ email: String(email).trim().toLowerCase() }).update({ role });

  if (!updated) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  console.log(`✓ ${email} is now ${role}. Have them log out and back in to refresh the token.`);
  await knex.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});