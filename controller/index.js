const USER = require("../model/user");
const { redisClient } = require("../config/redis");
const config = require("../config/config");
const {
  JWT_Signature,
  JWT_Verify,
  JWT_Decode,
  generateOTP,
  verifyOTP,
  emailTransporter,
} = require("../utils/helpers");

const createUser = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  const existingUser = await USER.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      message: "User with this email already exists",
    });
  }

  const otp = generateOTP();
  await redisClient.set(`otp:${phone}`, otp, { EX: 120 });

  console.log(`OTP for ${phone} is ${otp}`);

  const mailOptions = {
    from: config.mail_user,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It will expire in 2 minutes.`,
  };

  await emailTransporter.sendMail(mailOptions);
  console.log("Email sent to", email, "Successfully.");
  const newUser = new USER({
    name,
    email,
    password,
    phone,
  });

  await newUser.save();

  res.json({
    message: "User Created Successfully",
    data: newUser,
  });
};

const resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "email is required",
    });
  }

  const otp = generateOTP();
  await redisClient.set(`otp:${email}`, otp.toString(), { EX: 120 });

  const mailOptions = {
    from: config.mail_user,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It will expire in 2 minutes.`,
  };
  await emailTransporter.sendMail(mailOptions);
  console.log(`OTP for ${email} is ${otp}`);

  res.json({
    message: "OTP sent successfully",
  });
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const storedOtp = await redisClient.get(`otp:${email}`);

  if (!storedOtp) {
    return res.status(400).json({
      message: "OTP Expired",
    });
  }

  if (storedOtp !== otp.toString()) {
    return res.status(400).json({
      message: "Invalid OTP",
    });
  }

  await redisClient.del(`otp:${email}`);
  const newUser = await USER.findOneAndUpdate(
    { email },
    {
      $set: {
        isVerified: true,
      },
    },
    {
      new: true,
    },
  );

  if (!newUser) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  await redisClient.set(`user:${newUser._id}`, JSON.stringify(newUser), {
    EX: 60,
  });
  console.log("newUser is here ");

  res.json({
    message: "OTP Verified",
  });
};

const getUser = async (req, res) => {
  const cacheKey = "users";
  console.log("cache key", cacheKey);
  const cachedUser = await redisClient.get(cacheKey);
  console.log("cached user", cachedUser);

  if (cachedUser) {
    console.log("CACHE HIT");

    return res.json({
      source: "redis",
      data: JSON.parse(cachedUser),
    });
  }

  console.log("CACHE MISS");

  const user = await USER.find();

  await redisClient.set(cacheKey, JSON.stringify(user), {
    EX: 60,
  });

  return res.json({
    source: "mongodb",
    data: user,
  });
};

module.exports = {
  createUser,
  verifyOtp,
  resendOtp,
  getUser,
};
