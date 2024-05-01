// clearDatabase.js
const Database = require('@replit/database');
const db = new Database();

async function clearDatabase() {
  const keys = await db.list();
  for (let key of keys) {
    await db.delete(key);
  }
  console.log("Database cleared successfully.");
}

clearDatabase();
