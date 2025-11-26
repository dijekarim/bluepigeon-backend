"use strict";
const fs = require("fs");
const url = require("url");
const dotenv = require("dotenv");
const env = process.env.NODE_ENV || "development";
const envPath = `${process.cwd()}/src/config/environment/.env.${env}`;

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("✅ Loaded environment from:", envPath);
} else {
  console.log(
    "⚠️ No local .env file found. Using Heroku environment variables."
  );
}

// // Parse JAWSDB_MARIA_URL if present (for Heroku production)
// if (process.env.JAWSDB_MARIA_URL) {
//   const dbUrl = url.parse(process.env.JAWSDB_MARIA_URL);
//   const [username, password] = dbUrl.auth.split(":");

//   process.env.USERNAME = username;
//   process.env.PASSWORD = password;
//   process.env.HOST = dbUrl.hostname;
//   process.env.DATABASE = dbUrl.pathname.substring(1); // remove leading slash
//   process.env.DIALECT = "mariadb";
// }

module.exports = {
  development: {
    database: process.env.DATABASE,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    logging: false,
  },
  test: {
    database: process.env.DATABASE,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    logging: false,
  },
  production: {
    database: process.env.DATABASE,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    logging: false,
  },
};
