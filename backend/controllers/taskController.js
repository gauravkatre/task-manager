const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const mongoose = require('mongoose');

// @desc    Create task
// @route   POST /api/projects/:projectId/tasks
// @access  Private (Admin only)
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    if (assignedTo) {
      const project = await Project.findById(req.params.projectId);
      const isMember = project.members.some((m) => m.user.toString() === assignedTo);
      if (!isMember) {
        return res.status(400).json({ message: 'Assigned user is not a project member' });
      }
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'To Do',
      priority: priority || 'Medium',
      dueDate: dueDate || null,
      // ✅ Always store as ObjectId, never as string
      assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : null,
      project: req.params.projectId,
      createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private (members)
const getProjectTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;
    const filter = { project: req.params.projectId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (req.userRole === 'Member') {
      // ✅ Member ka filter fixed — query param se override nahi hoga
      // Member sirf apne assigned tasks dekh sakta hai
      filter.assignedTo = new mongoose.Types.ObjectId(req.user._id);
    } else {
      // ✅ Admin ke liye assignedTo query param allow karo (filter by user)
      if (assignedTo) {
        filter.assignedTo = new mongoose.Types.ObjectId(assignedTo);
      }
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:taskId
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'name color');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project._id);
    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!member) return res.status(403).json({ message: 'Access denied' });

    // ✅ Members can only view their own tasks
    if (
      member.role === 'Member' &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch task', error: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:taskId
// @access  Private (Admin: full update; Member: status only)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member) return res.status(403).json({ message: 'Access denied' });

    if (member.role === 'Member') {
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }
      if (req.body.status) task.status = req.body.status;
    } else {
      const { title, description, status, priority, dueDate, assignedTo } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (assignedTo !== undefined) {
        // ✅ Always convert to ObjectId when updating
        task.assignedTo = assignedTo
          ? new mongoose.Types.ObjectId(assignedTo)
          : null;
      }
    }

    await task.save();
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email');

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:taskId
// @access  Private (Admin only)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member || member.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can delete tasks' });
    }

    await Task.findByIdAndDelete(req.params.taskId);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
};

module.exports = { createTask, getProjectTasks, getTask, updateTask, deleteTask };