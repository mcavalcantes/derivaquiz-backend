const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const getRandomInteger = require("./lib/getRandomInteger");
const paramsToArray = require("./lib/paramsToArray");

const app = express();
const PORT = 3000;

app.use(cors());
const db = new sqlite3.Database("./prisma/database.db");

/* picks a random question from the database */
app.get("/api/random", (req, res) => {
  const response = {
    question: "",
    answers: [],
  };

  db.get('SELECT COUNT(*) as questionCount FROM "Question"', (err, row) => {
    if (err) {
      res.json(response);
    }

    const questionCount = row.questionCount;
    const randomId = getRandomInteger(questionCount);

    db.get('SELECT content FROM "Question" WHERE id = ?', [
      randomId,
    ], (err, row) => {
      if (err) {
        res.json(response);
      }

      response.question = row.content;

      db.all('SELECT content, correct FROM "Answer" WHERE questionId = ? ORDER BY RANDOM()', [
        randomId,
      ], (err, rows) => {
        if (err) {
          res.json(response);
        }

        response.answers = rows;
        res.json(response);
      });
    });
  });
});

/* picks a random question based on `type` and `difficulty` */
app.get("/api/get", (req, res) => {
  const response = {
    question: "",
    answers: [],
  };

  const { type, difficulty } = req.query;

  if (!type || !difficulty) {
    res.json(response);
  }

  // SQL injection prevention
  const typesArray = paramsToArray(type);
  const typesTuple = typesArray.map(() => "?").join(", ");

  // SQL injection prevention
  const difficultiesArray = paramsToArray(difficulty);
  const difficultiesTuple = difficultiesArray.map(() => "?").join(", ");

  const questionQuery = `SELECT id, content FROM "Question" WHERE type IN (${typesTuple}) AND difficulty IN (${difficultiesTuple}) ORDER BY RANDOM()`;

  db.get(questionQuery, [
    ...typesArray,
    ...difficultiesArray,
  ], (err, row) => {
    if (err) {
      res.json(response);
    }

    const { id, content } = row;
    response.question = content;

    db.all('SELECT content, correct FROM "Answer" WHERE questionId = ? ORDER BY RANDOM()', [
      id,
    ], (err, rows) => {
      if (err) {
        res.json(response);
      }

      response.answers = rows;
      res.json(response);
    });
  });
});

app.listen(PORT);
