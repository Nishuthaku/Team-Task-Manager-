const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard — Get dashboard stats
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};

    // Members only see their own task stats
    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id;
    }

    const totalTasks = await Task.countDocuments(filter);
    const completedTasks = await Task.countDocuments({ ...filter, status: 'Done' });
    const inProgressTasks = await Task.countDocuments({ ...filter, status: 'In Progress' });
    const pendingTasks = await Task.countDocuments({ ...filter, status: 'Pending' });

    let totalProjects = 0;
    let totalUsers = 0;

    if (req.user.role === 'admin') {
      totalProjects = await Project.countDocuments();
      totalUsers = await User.countDocuments();
    }

    res.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      totalProjects,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

module.exports = router;
