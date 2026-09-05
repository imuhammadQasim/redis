const { Queue } = require("bullmq");
const { bullmqConnection } = require("./connection");
const { EMAIL_QUEUE_NAME } = require("./email.constants");

const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 1000,
  },
});

const enqueueEmail = (mailOptions) =>
  emailQueue.add("send-email", mailOptions, {
    jobId: `email-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  });

module.exports = {
  emailQueue,
  enqueueEmail,
  EMAIL_QUEUE_NAME,
};
