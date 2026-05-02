const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { projectMember, projectAdmin } = require('../middleware/role');
const {
  getProjectTasks,
  getMyTasks,
  getAllTasks,
  getDashboardStats,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.use(protect); // All task routes are protected

// Dashboard & My Tasks (no project context needed)
router.get('/dashboard', getDashboardStats);
router.get('/my-tasks', getMyTasks);
router.get('/all', getAllTasks);

// Project-scoped tasks
router.get('/project/:projectId', projectMember, getProjectTasks);

// Task CRUD
router.post(
  '/',
  [body('title').trim().notEmpty().withMessage('Task title is required'),
   body('project').notEmpty().withMessage('Project ID is required')],
  projectAdmin,
  createTask
);

router.route('/:id').put(updateTask).delete(deleteTask);

module.exports = router;
