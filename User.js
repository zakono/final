const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  age: Number,
  gender: String,
  role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
  twoFA: { type: Boolean, default: false },
  twoFACode: String,
  twoFACodeExpires: Date,
});

module.exports = mongoose.model('User', userSchema);
