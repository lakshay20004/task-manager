const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { projectMember, projectAdmin } = require('../middleware/role');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');

const router = express.Router();

router.use(protect); // All project routes are protected

router
  .route('/')
  .get(getProjects)
  .post(
    [body('name').trim().notEmpty().withMessage('Project name is required')],
    createProject
  );

router
  .route('/:id')
  .get(getProject)
  .put(projectAdmin, updateProject)
  .delete(projectAdmin, deleteProject);

router.post(
  '/:id/members',
  projectAdmin,
  [body('email').isEmail().withMessage('Valid email is required')],
  addMember
);

router.delete('/:id/members/:userId', projectAdmin, removeMember);

module.exports = router;
