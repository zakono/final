const mongoose = require('mongoose');

const carouselTextSchema = new mongoose.Schema({
  slideNumber: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CarouselText', carouselTextSchema);




