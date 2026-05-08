const express = require('express');
const { body } = require('express-validator');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(
    [
      body('name').trim().notEmpty().withMessage('Project name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    ],
    createProject
  );

router.route('/:projectId')
  .get(getProject)
  .put(requireAdmin, updateProject)
  .delete(requireAdmin, deleteProject);

router.route('/:projectId/members')
  .post(
    requireAdmin,
    [body('email').isEmail().withMessage('Valid email required')],
    addMember
  );

router.delete('/:projectId/members/:userId', requireAdmin, removeMember);

module.exports = router;
