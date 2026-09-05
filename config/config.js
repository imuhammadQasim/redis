const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  env: process.env.NODE_ENV,
  window: process.env.WINDOW,
  max_limit: process.env.MAX_LIMIT,
  port: process.env.PORT,
  secret: process.env.SECRET,
  mongo_uri: process.env.MONGO_URI,
  redis_host: process.env.REDIS_HOST,
  redis_port: process.env.REDIS_PORT,
  redis_password: process.env.REDIS_PASSWORD,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expiration: process.env.JWT_EXPIRATION,
};
