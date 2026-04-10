"use strict";

require("dotenv").config();

// const ENV_PATH = path.join(__dirname, "..", "/config/.env");
// const config = env.config({ path: ENV_PATH });
// if (config.error) {
//   throw config.error;
// }

let DBURL = "mysql://";
DBURL += process.env.MYSQL_USER;
DBURL += ":";
DBURL += process.env.MYSQL_PASSWORD;
DBURL += "@" + process.env.MYSQL_HOST;
DBURL += ":" + (process.env.MYSQL_PORT || 3306);
DBURL += "/" + process.env.MYSQL_DATABASE;

module.exports = {
  db: {
    name: "db",
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    url: DBURL,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    lazyConnect: process.env.MYSQL_LAZY_CONNECT === "true",
    connector: "mysql"
  }
};
