const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "member" } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });
    
    // Create user
    const user = await User.create({ name, email, password, role });
    
    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret");
    
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    
    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret");
    
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
