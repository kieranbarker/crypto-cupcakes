require("dotenv").config({ quiet: true });

const argon2 = require("argon2");
const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
app.set("json spaces", "\t");

app.use(express.json());
app.use("/cupcakes", require("./routes/cupcakes"));

app.post("/register", async (req, res) => {
  const insert = db.prepare(
    `INSERT INTO users (email_address, password_hash)
		VALUES (:email_address, :password_hash)`
  );

  const email_address = req.body.email_address;
  const password_hash = await argon2.hash(req.body.password);

  insert.run({ email_address, password_hash });
  res.sendStatus(201);
});

app.post("/login", async (req, res) => {
  const select = db.prepare(
    "SELECT id, password_hash FROM users WHERE email_address = :email_address"
  );

  const user = select.get({
    email_address: req.body.email_address,
  });

  if (!user || !(await argon2.verify(user.password_hash, req.body.password))) {
    res.sendStatus(401);
    return;
  }

  const payload = {
    user_id: user.id,
  };

  const token = jwt.sign(payload, process.env.JWT_KEY, {
    expiresIn: "5m",
  });

  res.send(token);
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const port = 3000;

app.listen(port, (err) => {
  if (err) throw err;
  console.log(`Listening on port ${port}`);
});
