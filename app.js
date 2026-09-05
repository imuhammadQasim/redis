require("dotenv").config();
const express = require("express");
const userRoute = require("./route/index");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const { logger } = require("./middlewares/logger");
const config = require("./config/config");
const app = express();

app.use(express.json());
app.use(logger);

app.use("/api/v1", userRoute);

async function startServer() {
  try {
    await connectDB();
    await connectRedis();
    console.log("All databases connected successfully.");

    app.listen(config.port, "0.0.0.0", () => {
      console.log(`Server is running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error(
      "Failed to start server due to database connection error:",
      error,
    );
    process.exit(1);
  }
}

startServer();
