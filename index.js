require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Quote = require("./models/Quote");

const app = express();
app.use(express.json());
app.use(express.static("frontend"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

/* ---------- GET QUOTES ---------- */
app.get("/quotes", async (req, res) => {
  const { view } = req.query;
  const filter = {};

  if (view === "wishlist") filter.isWishlisted = true;
  if (view === "liked") filter.isLiked = true;
  if (view === "disliked") filter.isDisliked = true;
  if (view === "hidden") filter.isHidden = true;
  if (!view || view === "all") filter.isHidden = { $ne: true };

  const quotes = await Quote.find(filter);
  res.json({ quotes });
});

/* ---------- TOGGLE ACTION ---------- */
app.patch("/quotes/:id/:action", async (req, res) => {
  const { id, action } = req.params;
  const q = await Quote.findById(id);
  if (!q) return res.sendStatus(404);

  if (action === "wishlist") q.isWishlisted = !q.isWishlisted;
  if (action === "like") {
    q.isLiked = !q.isLiked;
    if (q.isLiked) q.isDisliked = false;
  }
  if (action === "dislike") {
    q.isDisliked = !q.isDisliked;
    if (q.isDisliked) q.isLiked = false;
  }
  if (action === "hide") q.isHidden = !q.isHidden;

  await q.save();
  res.json(q);
});

/* ---------- COUNTS ---------- */
app.get("/counts", async (_, res) => {
  res.json({
    wishlist: await Quote.countDocuments({ isWishlisted: true }),
    liked: await Quote.countDocuments({ isLiked: true }),
    disliked: await Quote.countDocuments({ isDisliked: true }),
    hidden: await Quote.countDocuments({ isHidden: true })
  });
});

app.listen(3000, () =>
  console.log("Server running → http://localhost:3000")
);