const router = require("express").Router();
const { auth, adminOnly } = require("../middleware/auth");
const Task = require("../models/Task");
const Project = require("../models/Project");

// GET /api/tasks
router.get("/", auth, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== "admin") {
      // Members see tasks assigned to them or in their projects
      const projects = await Project.find({ members: req.user._id }).select("_id");
      const projectIds = projects.map((p) => p._id);
      filter = {
        $or: [
          { assignedTo: req.user._id },
          { createdBy: req.user._id },
          { projectId: { $in: projectIds } },
        ],
      };
    }
    const tasks = await Task.find(filter)
      .populate("projectId", "name")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name")
      .sort("-createdAt");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, projectId, assignedTo } = req.body;
    if (!title) return res.status(400).json({ message: "Title required" });
    const task = await Task.create({ title, description, status, priority, dueDate: dueDate || undefined, projectId: projectId || undefined, assignedTo: assignedTo || undefined, createdBy: req.user._id });
    const populated = await task.populate(["projectId", "assignedTo", "createdBy"]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Only admin or creator or assignee can edit
    const canEdit =
      req.user.role === "admin" ||
      task.createdBy.toString() === req.user._id.toString() ||
      task.assignedTo?.toString() === req.user._id.toString();

    if (!canEdit) return res.status(403).json({ message: "Access denied" });

    const { title, description, status, priority, dueDate, projectId, assignedTo } = req.body;
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, dueDate: dueDate || undefined, projectId: projectId || undefined, assignedTo: assignedTo || undefined },
      { new: true }
    ).populate("projectId assignedTo createdBy");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id — admin only
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
