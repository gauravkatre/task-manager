const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Create project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { name, description, color } = req.body;

    const project = await Project.create({
      name,
      description,
      color: color || '#6366f1',
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'Admin' }],
    });

    await project.populate('members.user', 'name email avatar');
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
};

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Add task counts
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        const completedCount = await Task.countDocuments({ project: project._id, status: 'Done' });
        return {
          ...project.toObject(),
          taskCount,
          completedCount,
        };
      })
    );

    res.json(projectsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:projectId
// @access  Private (members only)
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('members.user', 'name email avatar')
      .populate('createdBy', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const taskCount = await Task.countDocuments({ project: project._id });
    const completedCount = await Task.countDocuments({ project: project._id, status: 'Done' });

    res.json({ ...project.toObject(), taskCount, completedCount });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project', error: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:projectId
// @access  Private (Admin only)
const updateProject = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const project = req.project;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;

    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update project', error: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:projectId
// @access  Private (Admin only)
const deleteProject = async (req, res) => {
  try {
    await Task.deleteMany({ project: req.params.projectId });
    await Project.findByIdAndDelete(req.params.projectId);
    res.json({ message: 'Project and all associated tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project', error: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:projectId/members
// @access  Private (Admin only)
const addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const project = req.project;

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    project.members.push({ user: userToAdd._id, role: role || 'Member' });
    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add member', error: error.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:projectId/members/:userId
// @access  Private (Admin only)
const removeMember = async (req, res) => {
  try {
    const project = req.project;
    const { userId } = req.params;

    // Can't remove yourself if you're the only admin
    const admins = project.members.filter((m) => m.role === 'Admin');
    const isTargetAdmin = project.members.find(
      (m) => m.user.toString() === userId && m.role === 'Admin'
    );
    if (isTargetAdmin && admins.length === 1) {
      return res.status(400).json({ message: 'Cannot remove the only admin from project' });
    }

    project.members = project.members.filter((m) => m.user.toString() !== userId);
    await project.save();
    await project.populate('members.user', 'name email avatar');

    // Unassign tasks from removed user
    await Task.updateMany(
      { project: project._id, assignedTo: userId },
      { $set: { assignedTo: null } }
    );

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove member', error: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
