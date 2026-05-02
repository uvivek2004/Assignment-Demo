const router = require("express").Router();
const { auth, adminOnly } = require("../middleware/auth");
const Project = require("../models/Project");

// GET /api/projects
router.get("/", auth, async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? {}
        : { $or: [{ owner: req.user._id }, { members: req.user._id }] };
    const projects = await Project.find(filter)
      .populate("owner", "name email")
      .populate("members", "name email role")
      .sort("-createdAt");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects — admin only
router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    if (!name) return res.status(400).json({ message: "Project name required" });
    const project = await Project.create({ name, description, owner: req.user._id, members: members || [] });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/projects/:id — admin only
router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("owner", "name email")
      .populate("members", "name email role");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id — admin only
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
