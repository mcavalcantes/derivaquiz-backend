const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3000;

app.use(cors());

const db = new sqlite3.Database("./prisma/database.db");

app.get("/api", (req, res) => {
  let { types, difficulties } = req.query;

  const response = {
    "question": "",
    "answers": [],
  };

  if (!types || !difficulties) {
    res.json(response);
  }

  if (!Array.isArray(types))
    types = types ? [types] : [];

  if (!Array.isArray(difficulties))
    difficulties = difficulties ? [difficulties] : [];

  let typeQuery = "";
  switch (types.length) {
    case 1:
      typeQuery = `type = '${types[0]}'`;
      break;
    case 2:
      typeQuery = `type = '${types[0]}' OR type = '${types[1]}'`;
      break;
    case 3:
      typeQuery = `type = '${types[0]}' OR type = '${types[1]}' OR type = '${types[2]}'`;
      break;
  }

  let difficultyQuery = "";
  switch (difficulties.length) {
    case 1:
      difficultyQuery = `difficulty = '${difficulties[0]}'`;
      break;
    case 2:
      difficultyQuery = `difficulty = '${difficulties[0]}' OR difficulty = '${difficulties[1]}'`;
      break;
    case 3:
      difficultyQuery = `difficulty = '${difficulties[0]}' OR difficulty = '${difficulties[1]}' OR difficulty = '${difficulties[2]}'`;
      break;
    case 4:
      difficultyQuery = `difficulty = '${difficulties[0]}' OR difficulty = '${difficulties[1]}' OR difficulty = '${difficulties[2]}' OR difficulty = '${difficulties[3]}'`;
      break;
  }

  const query = `SELECT id, content FROM "Question" WHERE (${typeQuery}) AND (${difficultyQuery}) ORDER BY RANDOM() LIMIT 1`;

  db.get(query, (err, row) => {
    const { id, content } = row;
    response["question"] = content;

    db.all('SELECT content, correct FROM "Answer" WHERE questionId = ? ORDER BY RANDOM()', [id], (err, rows) => {
      response["answers"] = rows;
      res.json(response);
    });
  });
});

app.listen(port);
