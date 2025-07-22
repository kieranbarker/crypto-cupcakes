require("dotenv").config({ quiet: true });
const crypto = require("crypto");

const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

exports.encrypt = function (text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();
  return iv.toString("hex") + encrypted + tag.toString("hex");
};

exports.decrypt = function (encodedString) {
  const ivHex = encodedString.slice(0, 24); // First 24 characters for IV (12 bytes in hex)
  const tagHex = encodedString.slice(-32); // Last 32 characters for tag (16 bytes in hex)
  const encryptedData = encodedString.slice(24, -32); // Middle part for encrypted data

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
