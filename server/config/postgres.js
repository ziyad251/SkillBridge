const { Pool } = require("pg");

const databaseUrl = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl ? { rejectUnauthorized: false } : undefined,
});

pool.on("error", (error) => {
  console.error("[PostgreSQL] Pool error:", error.message);
});

async function testPostgresConnection() {
  if (!databaseUrl) {
    console.error("[PostgreSQL] DATABASE_URL is missing in .env");
    return false;
  }

  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected successfully.");
    return true;
  } catch (error) {
    console.error("[PostgreSQL] Connection failed:", error.message);
    return false;
  }
}

module.exports = { pool, testPostgresConnection };
