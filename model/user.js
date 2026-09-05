const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: String,
  phone: String,
  password: String,
  is_verified: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("USER", userSchema);
