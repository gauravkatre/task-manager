const Project = require('../models/Project');

// Check if user is Admin in the project
const requireAdmin = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId || req.body.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member || member.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error in role check' });
  }
};

// Check if user is a member of the project (any role)
const requireMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId || req.body.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this project.' });
    }

    req.project = project;
    req.userRole = member.role;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error in role check' });
  }
};

module.exports = { requireAdmin, requireMember };
