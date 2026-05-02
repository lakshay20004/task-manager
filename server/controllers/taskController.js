const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private (member)
const getProjectTasks = async (req, res) => {
  try {
    const { status, priority, assignee } = req.query;
    const filter = { project: req.params.projectId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort('-createdAt');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current user's tasks across all projects
// @route   GET /api/tasks/my-tasks
// @access  Private
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id })
      .populate('project', 'name')
      .populate('createdBy', 'name email avatar')
      .sort('-createdAt');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // Get all projects user is a member of
    const projects = await Project.find({ 'members.user': req.user._id });
    const projectIds = projects.map((p) => p._id);

    // Get task counts by status
    const statusCounts = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const counts = { todo: 0, 'in-progress': 0, done: 0, total: 0 };
    statusCounts.forEach((sc) => {
      counts[sc._id] = sc.count;
      counts.total += sc.count;
    });

    // Overdue tasks
    const overdueTasks = await Task.find({
      project: { $in: projectIds },
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' },
    })
      .populate('project', 'name')
      .populate('assignee', 'name email avatar')
      .sort('dueDate')
      .limit(10);

    // Recent tasks
    const recentTasks = await Task.find({
      project: { $in: projectIds },
    })
      .populate('project', 'name')
      .populate('assignee', 'name email avatar')
      .sort('-createdAt')
      .limit(10);

    // My tasks
    const myTasks = await Task.find({
      assignee: req.user._id,
      status: { $ne: 'done' },
    })
      .populate('project', 'name')
      .sort('-createdAt')
      .limit(10);

    res.json({
      counts,
      overdueTasks,
      recentTasks,
      myTasks,
      totalProjects: projects.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private (admin of the project)
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, project, assignee, priority, dueDate } =
      req.body;

    const task = await Task.create({
      title,
      description,
      project,
      assignee: assignee || null,
      createdBy: req.user._id,
      priority: priority || 'medium',
      dueDate: dueDate || null,
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (member - can update status; admin - can update all)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is a member of the project
    const project = await Project.findById(task.project);
    const memberEntry = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!memberEntry) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Members can only update status of their own tasks
    if (memberEntry.role === 'member') {
      if (task.assignee?.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: 'Members can only update their own tasks' });
      }
      // Members can only change status
      task.status = req.body.status || task.status;
    } else {
      // Admins can update everything
      task.title = req.body.title || task.title;
      task.description =
        req.body.description !== undefined
          ? req.body.description
          : task.description;
      task.assignee =
        req.body.assignee !== undefined ? req.body.assignee : task.assignee;
      task.status = req.body.status || task.status;
      task.priority = req.body.priority || task.priority;
      task.dueDate =
        req.body.dueDate !== undefined ? req.body.dueDate : task.dueDate;
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (admin of the project)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is admin of the project
    const project = await Project.findById(task.project);
    const memberEntry = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!memberEntry || memberEntry.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Only project admins can delete tasks' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get ALL tasks across all user's projects
// @route   GET /api/tasks/all
// @access  Private
const getAllTasks = async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id });
    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name')
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort('-createdAt');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProjectTasks,
  getMyTasks,
  getAllTasks,
  getDashboardStats,
  createTask,
  updateTask,
  deleteTask,
};
