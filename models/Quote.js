const mongoose = require("mongoose");

const QuoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: String,
  tags: [String],

  isWishlisted: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: false },
  isLiked: { type: Boolean, default: false },
  isDisliked: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Quote", QuoteSchema);
