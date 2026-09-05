const logger = (req, res, next) => {
  const startedAt = Date.now();
  const timestamp = new Date().toISOString();
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  console.log(`📡 [${timestamp}] ${req.method} ${req.originalUrl} - IP: ${ip}`);

  res.on("finish", () => {
    const duration = Date.now() - startedAt;
    const status = res.statusCode;

    let statusEmoji = "🟢";
    if (status >= 400 && status < 500) statusEmoji = "🟡";
    if (status >= 500) statusEmoji = "🔴";

    console.log(
      `🏁 [${timestamp}] ${statusEmoji} ${req.method} ${req.originalUrl} | Status: ${status} | Time: ${duration}ms`,
    );
  });

  next();
};

module.exports = {
  logger,
};
