const { createClient } = require("redis");
const config = require("./config");

const redisClient = createClient({
  url: config.redis_url,
});

redisClient.on("error", (err) => {
  console.log("Redis Error:", err);
});

const connectRedis = async () => {
  await redisClient.connect();
  console.log("Redis Connected");
};

module.exports = {
  redisClient,
  connectRedis,
};
