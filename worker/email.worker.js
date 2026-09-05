require("dotenv").config();

const { Worker } = require("bullmq");
const { emailTransporter } = require("../utils/helpers");
const { bullmqConnection } = require("../queue/connection");
const { EMAIL_QUEUE_NAME } = require("../queue/email.constants");

const emailWorker = new Worker(
  EMAIL_QUEUE_NAME,
  async (job) => {
    await emailTransporter.sendMail(job.data);
    console.log(`Email job ${job.id} completed for ${job.data.to}`);
  },
  {
    connection: bullmqConnection,
    concurrency: 5,
  },
);

emailWorker.on("failed", (job, error) => {
  console.error(
    `Email job ${job?.id || "unknown"} failed (attempt ${job?.attemptsMade || 0}):`,
    error,
  );
});

emailWorker.on("error", (error) => {
  console.error("Email worker error:", error);
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Closing email worker...`);
  await emailWorker.close();
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

console.log("Email worker is running");
