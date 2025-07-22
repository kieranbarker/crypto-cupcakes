const db = require("./db");
const { users, cupcakes } = require("./data.json");

db.exec(`
  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS cupcakes;

	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY,
		email_address TEXT UNIQUE,
		password_hash TEXT
	);
	
	CREATE TABLE IF NOT EXISTS cupcakes (
		id INTEGER PRIMARY KEY,
		flavour TEXT,
		instructions TEXT,
		user_id INTEGER,
		FOREIGN KEY(user_id) REFERENCES users(id)
	);
`);

const insertUser = db.prepare(
  "INSERT INTO users VALUES (:id, :email_address, :password_hash)"
);

const insertManyUsers = db.transaction((users) => {
  for (const user of users) {
    insertUser.run(user);
  }
});

const insertCupcake = db.prepare(
  "INSERT INTO cupcakes VALUES (:id, :flavour, :instructions, :user_id)"
);

const insertManyCupcakes = db.transaction((cupcakes) => {
  for (const cupcake of cupcakes) {
    insertCupcake.run(cupcake);
  }
});

insertManyUsers(users);
insertManyCupcakes(cupcakes);
