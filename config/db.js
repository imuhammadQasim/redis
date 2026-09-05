const mongoose = require("mongoose");
const config = require("./config");
async function connectDB() {
  try {
    await mongoose.connect(config.mongo_uri);
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
