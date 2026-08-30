const mongoose = require('mongoose');
const Task = require('../models/Task');
const store = require('../data/store'); // Fallback memory store if DB disconnected

// Check if MongoDB connection is ready
const isDbConnected = () => mongoose.connection.readyState === 1;

// 1. GET /api/tasks — Retrieve paginated tasks scoped to authenticated user
const getAllTasks = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 5);
    const skip = (page - 1) * limit;

    // Always filter by the authenticated user's ID
    const userId = req.user.id;
    const conditions = [{ userId }];

    if (req.query.priority) {
      conditions.push({ priority: req.query.priority });
    }
    if (req.query.status && req.query.status !== 'all') {
      if (req.query.status === 'completed') {
        conditions.push({ $or: [{ status: 'completed' }, { completed: true }] });
      } else if (req.query.status === 'in_progress') {
        conditions.push({ status: 'in_progress' });
      } else if (req.query.status === 'pending') {
        conditions.push({
          $or: [
            { status: 'pending' },
            { status: { $exists: false }, completed: false },
            { status: null, completed: false }
          ]
        });
      }
    }
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      conditions.push({
        $or: [{ title: searchRegex }, { description: searchRegex }]
      });
    }

    const filter = { $and: conditions };

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

    // Fallback in-memory store (filtered by userId)
    let filteredTasks = store.tasks.filter(t => t.userId === userId);
    if (req.query.priority) {
      filteredTasks = filteredTasks.filter(t => t.priority === req.query.priority);
    }
    if (req.query.status && req.query.status !== 'all') {
      filteredTasks = filteredTasks.filter(t => {
        const taskStatus = t.status || (t.completed ? 'completed' : 'pending');
        return taskStatus === req.query.status;
      });
    }
    if (req.query.search) {
      const q = req.query.search.toLowerCase();
      filteredTasks = filteredTasks.filter(t =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
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

// 2. GET /api/tasks/:id — Retrieve single task (only if owned by user)
const getTaskById = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (isDbConnected()) {
      const task = await Task.findOne({ _id: req.params.id, userId });
      if (!task) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Task with ID '${req.params.id}' not found`
        });
      }
      return res.status(200).json({
        success: true,
        source: 'MongoDB',
        data: task
      });
    }

    const numericId = parseInt(req.params.id, 10);
    const task = store.tasks.find(
      t => (t.id === numericId || t._id === req.params.id) && t.userId === userId
    );
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

// 3. POST /api/tasks — Create a new task, stamped with the authenticated user's ID
const createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority, status } = req.body;
    const userId = req.user.id;
    const computedStatus = status || (completed ? 'completed' : 'pending');
    const isCompleted = computedStatus === 'completed';

    if (isDbConnected()) {
      const newTask = await Task.create({
        userId,
        title,
        description,
        completed: isCompleted,
        status: computedStatus,
        priority
      });

      console.log(`\n========================================`);
      console.log(`🍃 MONGODB NOTIFICATION: Document Created!`);
      console.log(`   ID: ${newTask._id} | User: ${userId} | Title: "${newTask.title}" | Status: ${newTask.status}`);
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
      userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: isCompleted,
      status: computedStatus,
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

// 4. PUT /api/tasks/:id — Update task (only if owned by the requesting user)
const updateTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority, status } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;

    if (status !== undefined) {
      updateData.status = status;
      updateData.completed = status === 'completed';
    } else if (completed !== undefined) {
      updateData.completed = Boolean(completed);
      updateData.status = completed ? 'completed' : 'pending';
    }

    if (isDbConnected()) {
      // Scope update to current user (prevents cross-user mutation)
      const updatedTask = await Task.findOneAndUpdate(
        { _id: req.params.id, userId },
        updateData,
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
      console.log(`   ID: ${updatedTask._id} | User: ${userId} | Title: "${updatedTask.title}" | Status: ${updatedTask.status}`);
      console.log(`========================================\n`);

      return res.status(200).json({
        success: true,
        message: 'Task updated successfully in MongoDB',
        source: 'MongoDB',
        data: updatedTask
      });
    }

    // Fallback update (also scoped by userId)
    const numericId = parseInt(req.params.id, 10);
    const index = store.tasks.findIndex(
      t => (t.id === numericId || t._id === req.params.id) && t.userId === userId
    );
    if (index === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID '${req.params.id}' not found`
      });
    }

    const task = store.tasks[index];
    if (title !== undefined) task.title = String(title).trim();
    if (description !== undefined) task.description = String(description).trim();
    if (priority !== undefined) task.priority = String(priority).trim();
    if (status !== undefined) {
      task.status = status;
      task.completed = status === 'completed';
    } else if (completed !== undefined) {
      task.completed = Boolean(completed);
      task.status = completed ? 'completed' : 'pending';
    }

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

// 5. DELETE /api/tasks/:id — Delete task (only if owned by the requesting user)
const deleteTask = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (isDbConnected()) {
      // Scope delete to current user (prevents cross-user deletion)
      const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, userId });

      if (!deletedTask) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Task with ID '${req.params.id}' not found`
        });
      }

      console.log(`\n========================================`);
      console.log(`🚨 MONGODB NOTIFICATION: Document Deleted!`);
      console.log(`   Deleted ID: ${deletedTask._id} | User: ${userId} | Title: "${deletedTask.title}"`);
      console.log(`========================================\n`);

      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully from MongoDB',
        source: 'MongoDB',
        data: deletedTask
      });
    }

    // Fallback delete (also scoped by userId)
    const numericId = parseInt(req.params.id, 10);
    const index = store.tasks.findIndex(
      t => (t.id === numericId || t._id === req.params.id) && t.userId === userId
    );
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
