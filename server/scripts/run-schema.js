require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { pool } = require("../config/postgres");

async function run() {
  const sql = fs.readFileSync(
    path.join(__dirname, "..", "migrations", "001_initial_schema.sql"),
    "utf8"
  );
  await pool.query(sql);
  console.log("PostgreSQL schema applied successfully.");
}

run()
  .catch((error) => {
    console.error("[schema] Failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());