// viewDatabase.js
const Database = require('@replit/database');
const db = new Database();

async function viewDatabase() {
  const keys = await db.list();

  for (let key of keys) {
    const value = await db.get(key);
    console.log(`Key: ${key}, Value: ${value}`);
  }
}

viewDatabase();
