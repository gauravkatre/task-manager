const express = require('express');
const { body } = require('express-validator');
const { createTask, getProjectTasks, getTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin, requireMember } = require('../middleware/roleMiddleware');

const router = express.Router({ mergeParams: true });

router.use(protect);

// Project-scoped task routes
router.route('/')
  .get(requireMember, getProjectTasks)
  .post(
    requireAdmin,
    [
      body('title').trim().notEmpty().withMessage('Task title is required').isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
      body('status').optional().isIn(['To Do', 'In Progress', 'Done']).withMessage('Invalid status'),
      body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
    ],
    createTask
  );

module.exports = router;
