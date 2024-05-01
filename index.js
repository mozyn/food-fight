const express = require('express');
const bodyParser = require('body-parser');
const Database = require('@replit/database');

const app = express();
const port = 3000;
const db = new Database();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("client"));

app.use(express.static(__dirname)); // This serves all static files in the root directory.
// Clear the database every 24 hours

setInterval(clearDatabase, 24 * 60 * 60 * 1000);


let votes = {};

app.get('/results', (req, res) => {
  res.json(votes);
});

app.post("/saveOptions", async (req, res) => {
  try {
    const { id, foods } = req.body;
    await db.set(id, foods);
    res.json({ success: true, message: "Food options saved successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving food options." });
  }
});


// Endpoint to retrieve food options based on the unique ID
app.get("/getOptions/:id", async (req, res) => {
  const uniqueId = req.params.id;
  const options = await db.get(uniqueId);
  res.json(options || []);
});

app.post("/saveWinner", async (req, res) => {
  const { id, winner } = req.body;

  try {
    // Fetch current scores
    let scores = await db.get("scores_" + id) || {};

    // Increment score for the winner
    scores[winner] = (scores[winner] || 0) + 1;

    // Save updated scores back to the database
    await db.set("scores_" + id, scores);

    res.json({ success: true, message: "Vote recorded." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error recording vote." });
  }
});


app.get("/getScores/:id", async (req, res) => {
  const uniqueId = req.params.id;

  try {
    const scores = await db.get("scores_" + uniqueId) || {};
    res.json(scores);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching scores." });
  }
});


async function clearDatabase() {
  try {
    // Fetch all keys in the database
    const keys = await db.list();

    // Delete each key
    for (let key of keys) {
      await db.delete(key);
    }

    console.log("Database cleared successfully.");
  } catch (error) {
    console.error("Error clearing the database:", error);
  }
}


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
