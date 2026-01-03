const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "1235";

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/contentplannerdb")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Idea Schema
const ideaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  platform: String,
  status: { type: String, default: "draft" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  created_at: { type: Date, default: Date.now },
});

const Idea = mongoose.model("Idea", ideaSchema);

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// CREATE idea
app.post("/api/ideas", verifyToken, async (req, res) => {
  try {
    const { title, description, platform } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const idea = new Idea({ title, description, platform, userId: req.userId });
    await idea.save();

    res.json({ id: idea._id, message: "Idea created!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all ideas
app.get("/api/ideas", verifyToken, async (req, res) => {
  try {
    const ideas = await Idea.find({ userId: req.userId }).sort({
      created_at: -1,
    });
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE status
app.patch("/api/ideas/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    await Idea.findOneAndUpdate({ _id: id, userId: req.userId }, { status });
    res.json({ message: "Status updated!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE idea
app.delete("/api/ideas/:id", verifyToken, async (req, res) => {
  try {
    await Idea.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Idea deleted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
