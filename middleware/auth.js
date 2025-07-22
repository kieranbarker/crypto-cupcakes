require("dotenv").config({ quiet: true });
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const header = req.get("Authorization");

  if (!header) {
    res.set("WWW-Authenticate", "Bearer").sendStatus(401);
    return;
  }

  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.sendStatus(401);
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user_id = decoded.user_id;
    next();
  } catch (error) {
    console.error(error);
    res.sendStatus(401);
  }
}

module.exports = auth;
