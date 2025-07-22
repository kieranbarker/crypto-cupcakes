const express = require("express");
const db = require("../db");
const { encrypt, decrypt } = require("../encryption-utils");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

router.post("/", (req, res) => {
  const insert = db.prepare(
    `INSERT INTO cupcakes (flavour, instructions, user_id)
    VALUES (:flavour, :instructions, :user_id)`
  );

  const { lastInsertRowid } = insert.run({
    flavour: req.body.flavour,
    instructions: encrypt(req.body.instructions),
    user_id: req.user_id,
  });

  const select = db.prepare("SELECT * FROM cupcakes WHERE id = :id LIMIT 1");
  const cupcake = select.get({ id: lastInsertRowid });
  cupcake.instructions = decrypt(cupcake.instructions);

  res.status(201).location(`/cupcakes/${lastInsertRowid}`).json(cupcake);
});

router.get("/", (req, res) => {
  let cupcakes;

  if (req.query.flavour) {
    const select = db.prepare(
      `SELECT * FROM cupcakes
      WHERE flavour LIKE :flavour AND user_id = :user_id`
    );

    cupcakes = select.all({
      flavour: req.query.flavour,
      user_id: req.user_id,
    });
  } else {
    const select = db.prepare(
      "SELECT * FROM cupcakes WHERE user_id = :user_id"
    );

    cupcakes = select.all({
      user_id: req.user_id,
    });
  }

  for (const cupcake of cupcakes) {
    cupcake.instructions = decrypt(cupcake.instructions);
  }

  res.status(200).json(cupcakes);
});

router.get("/:id", (req, res, next) => {
  const select = db.prepare(
    `SELECT * FROM cupcakes
    WHERE id = :id AND user_id = :user_id
    LIMIT 1`
  );

  const cupcake = select.get({
    id: req.params.id,
    user_id: req.user_id,
  });

  if (!cupcake) {
    next();
    return;
  }

  cupcake.instructions = decrypt(cupcake.instructions);
  res.status(200).json(cupcake);
});

router.put("/:id", (req, res) => {
  const update = db.prepare(
    `UPDATE cupcakes
    SET flavour = :flavour, instructions = :instructions
    WHERE id = :id AND user_id = :user_id`
  );

  const { changes } = update.run({
    flavour: req.body.flavour,
    instructions: encrypt(req.body.instructions),
    id: req.params.id,
    user_id: req.user_id,
  });

  if (changes) {
    const select = db.prepare("SELECT * FROM cupcakes WHERE id = :id LIMIT 1");
    const cupcake = select.get({ id: req.params.id });
    cupcake.instructions = decrypt(cupcake.instructions);
    res.status(200).json(cupcake);
    return;
  }

  const insert = db.prepare(
    "INSERT INTO cupcakes VALUES (:id, :flavour, :instructions, :user_id)"
  );

  const { lastInsertRowid } = insert.run({
    id: req.params.id,
    flavour: req.body.flavour,
    instructions: encrypt(req.body.instructions),
    user_id: req.user_id,
  });

  const select = db.prepare("SELECT * FROM cupcakes WHERE id = :id LIMIT 1");
  const cupcake = select.get({ id: lastInsertRowid });
  cupcake.instructions = decrypt(cupcake.instructions);

  res.status(201).json(cupcake);
});

router.delete("/:id", (req, res, next) => {
  const del = db.prepare(
    "DELETE FROM cupcakes WHERE id = :id AND user_id = :user_id"
  );

  const { changes } = del.run({ id: req.params.id, user_id: req.user_id });

  if (!changes) {
    next();
    return;
  }

  res.status(204).send();
});

module.exports = router;
