const express = require('express');
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/projects — Get all projects
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// POST /api/projects — Create a project (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    const project = await Project.create({
      name: name.trim(),
      createdBy: req.user._id,
    });

    await project.populate('createdBy', 'name email');

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// DELETE /api/projects/:id — Delete a project (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    await project.deleteOne();
    res.json({ message: 'Project deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

module.exports = router;
