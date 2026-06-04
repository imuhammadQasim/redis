require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const User = require("./model/user");
const { connectRedis, redisClient } = require("./redis");

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

connectRedis();

app.get("/", async (req, res) => {
  res.json("Server is Running.......!");
});

app.get("/users/:id", async (req, res) => {
  try {
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

    const user = await User.findById(id);

    await redisClient.set(cacheKey, JSON.stringify(user), {
      EX: 60,
    });

    return res.json({
      source: "mongodb",
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
});

app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  const otp = Math.floor(1000 + Math.random() * 9000);

  await redisClient.set(`otp:${phone}`, otp, {
    EX: 120,
  });
  res.json({
    otp,
  });
});

// create User
app.post("/create-user", async (req, res) => {
  const { name, email, password, phone } = req.body;

  const newUser = new User({
    name,
    email,
    password,
    phone,
  });

  await newUser.save();

  // await redisClient.set(`user:${newUser._id}`, JSON.stringify(newUser), {
  //   EX: 60,
  // });

  res.json({
    message: "User Created Successfully",
    data: newUser,
  });
});

app.post("/verify-otp", async (req, res) => {
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
});

app.listen(process.env.PORT, () => {
  console.log(`Server is runnign on http://localhost:${process.env.PORT}`);
});
