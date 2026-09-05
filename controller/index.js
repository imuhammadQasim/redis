const USER = require("../model/user");
const { redisClient } = require("../config/redis");
const config = require("../config/config");
const {
  JWT_Signature,
  JWT_Verify,
  JWT_Decode,
  generateOTP,
  verifyOTP,
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

const sendOtp = async (req, res) => {
  const { phone } = req.body;

  console.log(`\n--- NEW REQUEST ---`);
  console.log(`[API Hit] /send-otp route called for phone: ${phone}`);

  const otp = Math.floor(1000 + Math.random() * 9000);

  console.log(`[Redis] Saving OTP ${otp} for 120 seconds...`);
  await redisClient.set(`otp:${phone}`, otp, { EX: 120 });

  res.json({ otp });
};

const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  const storedOtp = await redisClient.get(`otp:${phone}`);

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

  await redisClient.del(`otp:${phone}`);
  let newUser = await User.findOneAndUpdate(
    { phone },
    {
      $set: {
        isVerified: true,
      },
    },
    {
      new: true,
    },
  );

  await redisClient.set(`user:${newUser._id}`, JSON.stringify(newUser), {
    EX: 60,
  });
  console.log("newUser is here ");

  res.json({
    message: "OTP Verified",
  });
};

const getUser = async (req, res) => {
  const { id } = req.params;

  const cacheKey = `user:${id}`;
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

  const user = await USER.findById(id);

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
  sendOtp,
  getUser,
};
