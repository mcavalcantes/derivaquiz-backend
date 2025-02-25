const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3000;

const db = new sqlite3.Database("./prisma/database.db");

app.get("/api", (req, res) => {
  const { type, difficulty } = req.query;

  const response = {
    "question": "",
    "answers": [],
  };

  if (!type || !difficulty) {
    res.json(response);
  }

  db.get('SELECT id, content FROM "Question" WHERE type = ? AND difficulty = ? ORDER BY RANDOM() LIMIT 1', [type, difficulty], (err, row) => {
    const { id, content } = row;
    response["question"] = content;

    db.all('SELECT content, correct FROM "Answer" WHERE questionId = ? ORDER BY RANDOM()', [id], (err, rows) => {
      response["answers"] = rows;
      res.json(response);
    });
  });
});

app.listen(port);
