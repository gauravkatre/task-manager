const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get dashboard stats for user
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all projects the user is a member of
    const projects = await Project.find({ 'members.user': userId });

    // No projects at all — return empty stats
    if (!projects.length) {
      return res.json({
        totalTasks: 0,
        tasksByStatus: { 'To Do': 0, 'In Progress': 0, Done: 0 },
        overdueTasks: 0,
        totalProjects: 0,
        tasksPerUser: [],
        recentTasks: [],
      });
    }

    const adminProjectIds = projects
      .filter((p) => p.members.some((m) => m.user.toString() === userId.toString() && m.role === 'Admin'))
      .map((p) => p._id);

    const memberProjectIds = projects
      .filter((p) => p.members.some((m) => m.user.toString() === userId.toString() && m.role === 'Member'))
      .map((p) => p._id);

    // Build task filter safely — avoid empty $or
    let taskFilter = {};
    if (adminProjectIds.length > 0 && memberProjectIds.length > 0) {
      taskFilter = {
        $or: [
          { project: { $in: adminProjectIds } },
          { project: { $in: memberProjectIds }, assignedTo: userId },
        ],
      };
    } else if (adminProjectIds.length > 0) {
      taskFilter = { project: { $in: adminProjectIds } };
    } else if (memberProjectIds.length > 0) {
      taskFilter = { project: { $in: memberProjectIds }, assignedTo: userId };
    }

    const [totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks] = await Promise.all([
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'To Do' }),
      Task.countDocuments({ ...taskFilter, status: 'In Progress' }),
      Task.countDocuments({ ...taskFilter, status: 'Done' }),
      Task.countDocuments({
        ...taskFilter,
        status: { $ne: 'Done' },
        dueDate: { $lt: new Date() },
      }),
    ]);

    // Tasks per user (admin projects only)
    let tasksPerUser = [];
    if (adminProjectIds.length > 0) {
      tasksPerUser = await Task.aggregate([
        { $match: { project: { $in: adminProjectIds } } },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }, // ✅ fixed typo
        {
          $project: {
            _id: 1,
            count: 1,
            name: { $ifNull: ['$user.name', 'Unassigned'] },
            avatar: '$user.avatar',
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);
    }

    // Recent tasks
    const recentTasks = await Task.find(taskFilter)
      .populate('assignedTo', 'name avatar')
      .populate('project', 'name color')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalTasks,
      tasksByStatus: {
        'To Do': todoTasks,
        'In Progress': inProgressTasks,
        Done: doneTasks,
      },
      overdueTasks,
      totalProjects: projects.length,
      tasksPerUser,
      recentTasks,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
};

module.exports = { getDashboardStats };