const mongoose = require('mongoose');
const Task = require('../models/Task');
const store = require('../data/store'); // Fallback memory store if DB disconnected

// Check if MongoDB connection is ready
const isDbConnected = () => mongoose.connection.readyState === 1;

// 1. GET /api/tasks — Retrieve paginated tasks (Default: 5 per page)
const getAllTasks = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 5);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    if (isDbConnected()) {
      const total = await Task.countDocuments(filter);
      const totalPages = Math.ceil(total / limit) || 1;
      const tasks = await Task.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.status(200).json({
        success: true,
        count: tasks.length,
        total: total,
        totalPages: totalPages,
        currentPage: page,
        limit: limit,
        source: 'MongoDB',
        data: tasks
      });
    }

    // Fallback in-memory store pagination
    let filteredTasks = store.tasks;
    if (req.query.priority) {
      filteredTasks = filteredTasks.filter(t => t.priority === req.query.priority);
    }
    if (req.query.search) {
      const q = req.query.search.toLowerCase();
      filteredTasks = filteredTasks.filter(t => t.title.toLowerCase().includes(q));
    }

    const total = filteredTasks.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedTasks = filteredTasks.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      count: paginatedTasks.length,
      total: total,
      totalPages: totalPages,
      currentPage: page,
      limit: limit,
      source: 'In-Memory Fallback',
      data: paginatedTasks
    });
  } catch (err) {
    next(err);
  }
};

// 2. GET /api/tasks/:id — Retrieve single task by ID
const getTaskById = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Task with ID '${req.params.id}' not found in database`
        });
      }
      return res.status(200).json({
        success: true,
        source: 'MongoDB',
        data: task
      });
    }

    const numericId = parseInt(req.params.id, 10);
    const task = store.tasks.find(t => t.id === numericId || t._id === req.params.id);
    if (!task) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID '${req.params.id}' not found`
      });
    }
    return res.status(200).json({
      success: true,
      source: 'In-Memory Fallback',
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// 3. POST /api/tasks — Create a new task with schema validation
const createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    if (isDbConnected()) {
      const newTask = await Task.create({
        title,
        description,
        completed,
        priority
      });

      console.log(`\n========================================`);
      console.log(`🍃 MONGODB NOTIFICATION: Document Created!`);
      console.log(`   ID: ${newTask._id} | Title: "${newTask.title}" | Priority: ${newTask.priority}`);
      console.log(`========================================\n`);

      return res.status(201).json({
        success: true,
        message: 'Task created successfully in MongoDB',
        source: 'MongoDB',
        data: newTask
      });
    }

    // Validation for memory store fallback
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title is required'
      });
    }

    const newTask = {
      id: store.nextId(),
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: Boolean(completed),
      priority: priority || 'medium',
      createdAt: new Date()
    };
    store.tasks.unshift(newTask);

    return res.status(201).json({
      success: true,
      message: 'Task created in Memory Fallback',
      source: 'In-Memory Fallback',
      data: newTask
    });
  } catch (err) {
    next(err);
  }
};

// 4. PUT /api/tasks/:id — Update existing task with validation
const updateTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    if (isDbConnected()) {
      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        { title, description, completed, priority },
        { new: true, runValidators: true }
      );

      if (!updatedTask) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Task with ID '${req.params.id}' not found`
        });
      }

      console.log(`\n========================================`);
      console.log(`🍃 MONGODB NOTIFICATION: Document Updated!`);
      console.log(`   ID: ${updatedTask._id} | Title: "${updatedTask.title}" | Completed: ${updatedTask.completed}`);
      console.log(`========================================\n`);

      return res.status(200).json({
        success: true,
        message: 'Task updated successfully in MongoDB',
        source: 'MongoDB',
        data: updatedTask
      });
    }

    // Fallback update
    const numericId = parseInt(req.params.id, 10);
    const index = store.tasks.findIndex(t => t.id === numericId || t._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID '${req.params.id}' not found`
      });
    }

    const task = store.tasks[index];
    if (title !== undefined) task.title = String(title).trim();
    if (description !== undefined) task.description = String(description).trim();
    if (completed !== undefined) task.completed = Boolean(completed);
    if (priority !== undefined) task.priority = String(priority).trim();

    return res.status(200).json({
      success: true,
      message: 'Task updated in Memory Fallback',
      source: 'In-Memory Fallback',
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// 5. DELETE /api/tasks/:id — Delete task from database
const deleteTask = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const deletedTask = await Task.findByIdAndDelete(req.params.id);

      if (!deletedTask) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Task with ID '${req.params.id}' not found`
        });
      }

      console.log(`\n========================================`);
      console.log(`🚨 MONGODB NOTIFICATION: Document Deleted!`);
      console.log(`   Deleted ID: ${deletedTask._id} | Title: "${deletedTask.title}"`);
      console.log(`========================================\n`);

      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully from MongoDB',
        source: 'MongoDB',
        data: deletedTask
      });
    }

    // Fallback delete
    const numericId = parseInt(req.params.id, 10);
    const index = store.tasks.findIndex(t => t.id === numericId || t._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID '${req.params.id}' not found`
      });
    }

    const deleted = store.tasks.splice(index, 1)[0];
    return res.status(200).json({
      success: true,
      message: 'Task deleted from Memory Fallback',
      source: 'In-Memory Fallback',
      data: deleted
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
