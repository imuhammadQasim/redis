const express = require("express");
const {
  createUser,
  verifyOtp,
  resendOtp,
  getUser,
} = require("../controller/index");
const router = express.Router();

router.get("/", async (req, res) => {
  res.json("Server is Running.......!");
});
router.post("/create", createUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.get("/users", getUser);

module.exports = router;
