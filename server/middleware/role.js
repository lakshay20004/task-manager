const Project = require('../models/Project');

// Check if user is a member of the project (any role)
const projectMember = async (req, res, next) => {
  try {
    const projectId =
      req.params.projectId || req.params.id || req.body.project;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res
        .status(403)
        .json({ message: 'Not authorized - not a project member' });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is an admin of the project
const projectAdmin = async (req, res, next) => {
  try {
    const projectId =
      req.params.projectId || req.params.id || req.body.project;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const memberEntry = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!memberEntry || memberEntry.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Not authorized - admin access required' });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { projectMember, projectAdmin };
