const express = require('express');
const Task = require('../models/Task');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/tasks — Get all tasks (optionally filter by projectId)
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
    }
    // Members see only their own tasks
    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// POST /api/tasks — Create a task (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, assignedTo, projectId, status } = req.body;

    if (!title || !assignedTo || !projectId) {
      return res.status(400).json({ message: 'Title, assignedTo, and projectId are required.' });
    }

    const task = await Task.create({
      title: title.trim(),
      assignedTo,
      projectId,
      status: status || 'Pending',
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('projectId', 'name');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// PATCH /api/tasks/:id/status — Update task status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Done'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Valid status is required: Pending, In Progress, Done.' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Members can only update tasks assigned to them
    if (req.user.role === 'member' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task.' });
    }

    task.status = status;
    await task.save();

    await task.populate('assignedTo', 'name email');
    await task.populate('projectId', 'name');

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// DELETE /api/tasks/:id — Delete a task (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    await task.deleteOne();
    res.json({ message: 'Task deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

module.exports = router;
