/**
 * seed.js — Populates the database with sample test data
 * Run: node seed.js  (from the backend/ directory with .env configured)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/team-task-manager';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});
  console.log('Cleared existing data');

  // Create users
  const users = await User.create([
    {
      name: 'Alice Admin',
      email: 'alice@example.com',
      password: 'password123',
      role: 'admin',
    },
    {
      name: 'Bob Builder',
      email: 'bob@example.com',
      password: 'password123',
      role: 'member',
    },
    {
      name: 'Carol Coder',
      email: 'carol@example.com',
      password: 'password123',
      role: 'member',
    },
  ]);
  console.log('Created 3 users');

  const [alice, bob, carol] = users;

  // Create projects
  const projects = await Project.create([
    { name: 'Website Redesign', createdBy: alice._id },
    { name: 'Mobile App Launch', createdBy: alice._id },
    { name: 'Q3 Marketing Campaign', createdBy: alice._id },
  ]);
  console.log('Created 3 projects');

  const [website, mobile, marketing] = projects;

  // Create tasks
  await Task.create([
    {
      title: 'Design homepage mockup',
      assignedTo: bob._id,
      projectId: website._id,
      status: 'In Progress',
    },
    {
      title: 'Write landing page copy',
      assignedTo: carol._id,
      projectId: website._id,
      status: 'Pending',
    },
    {
      title: 'Set up CI/CD pipeline',
      assignedTo: bob._id,
      projectId: mobile._id,
      status: 'Done',
    },
    {
      title: 'Create app wireframes',
      assignedTo: carol._id,
      projectId: mobile._id,
      status: 'In Progress',
    },
    {
      title: 'Create ad creatives',
      assignedTo: carol._id,
      projectId: marketing._id,
      status: 'Pending',
    },
    {
      title: 'Set up email campaign',
      assignedTo: bob._id,
      projectId: marketing._id,
      status: 'Pending',
    },
  ]);
  console.log('Created 6 tasks');

  console.log('\n✅ Seed complete! Test credentials:');
  console.log('  Admin:  alice@example.com / password123');
  console.log('  Member: bob@example.com   / password123');
  console.log('  Member: carol@example.com / password123');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
