const config = require("../config/config");

const redisUrl = new URL(
  config.redis_url ||
    `redis://${config.redis_host || "localhost"}:${config.redis_port || 6379}`,
);

const bullmqConnection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  maxRetriesPerRequest: null,
};

if (redisUrl.username || config.redis_username) {
  bullmqConnection.username = redisUrl.username || config.redis_username;
}

if (redisUrl.password || config.redis_password) {
  bullmqConnection.password = redisUrl.password || config.redis_password;
}

module.exports = { bullmqConnection };
