const { Sequelize } = require("sequelize");
const { DB_URI, DB_OPTIONS } = require("./config");

console.log("Connecting to database...".cyan);
const db = new Sequelize(DB_URI, DB_OPTIONS);
const testConnection = async () => {
  try {
    console.log("Authenticating...".cyan);
    await db.authenticate();
    console.log("Connection has been established successfully.".cyan);
    return db;
  } catch (error) {
    console.error("Unable to connect to the database:".red, error);
  }
};
testConnection();

db.sync(); // uncomment to initiate the database tables

module.exports = db;
