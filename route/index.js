const express = require("express");
const {
  createUser,
  verifyOtp,
  sendOtp,
  getUser,
} = require("../controller/index");
const router = express.Router();

router.post("/create", createUser);
router.post("/verify-otp", verifyOtp);
router.post("/send-otp", sendOtp);
router.get("/users/:id", getUser);

module.exports = router;
