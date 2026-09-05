const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const config = require("../config/config");
const { redisClient } = require("../config/redis");

const JWT_Signature = function (payload, secret, options) {
  return jwt.sign(payload, secret, options);
};

const JWT_Verify = function (token, secret) {
  return jwt.verify(token, secret);
};

const JWT_Decode = function (token, secret) {
  return jwt.decode(token, secret);
};

const generateOTP = function () {
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp;
};

const verifyOTP = async function (phone, otp) {
  const storedOtp = await redisClient.get(`otp:${phone}`);
  return storedOtp === otp;
};

const emailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: config.mail_user,
    pass: config.mail_password,
  },
});

module.exports = {
  JWT_Signature,
  JWT_Verify,
  JWT_Decode,
  generateOTP,
  verifyOTP,
  emailTransporter,
};
