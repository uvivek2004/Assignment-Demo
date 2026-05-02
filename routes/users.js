const router = require("express").Router();
const { auth, adminOnly } = require("../middleware/auth");
const User = require("../models/User");

// GET /api/users — all users (for assignment dropdowns)
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort("name");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/:id/role — admin changes role
router.patch("/:id/role", auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
