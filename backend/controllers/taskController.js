const mongoose = require('mongoose');
const Task = require('../models/Task');
const store = require('../data/store'); // Fallback memory store if DB disconnected

// Check if MongoDB connection is ready
const isDbConnected = () => mongoose.connection.readyState === 1;

// 1. GET /api/tasks — Retrieve paginated tasks with Role-Based Scoping
const getAllTasks = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 5);
    const skip = (page - 1) * limit;

    const user = req.user;
    const isManager = user.role === 'manager';
    const conditions = [];

    // Role-based visibility:
    // Manager: views all team tasks (or filters by specific employee or 'all_employees')
    // Employee: views tasks assigned to them, tasks assigned to 'All Employees', or created by them
    if (isManager) {
      if (req.query.assignedTo && req.query.assignedTo !== 'all') {
        if (req.query.assignedTo === 'all_employees' || req.query.assignedTo === 'All Employees') {
          conditions.push({
            $or: [
              { 'assignedTo.id': 'all' },
              { 'assignedTo.name': 'All Employees' },
              { 'assignedTo.email': 'all@team.dev' }
            ]
          });
        } else {
          conditions.push({
            $or: [
              { 'assignedTo.email': req.query.assignedTo },
              { 'assignedTo.name': req.query.assignedTo },
              { 'assignedTo.id': req.query.assignedTo }
            ]
          });
        }
      }
    } else {
      // Employee sees tasks assigned directly to them, tasks assigned to 'All Employees', or created by them
      conditions.push({
        $or: [
          { 'assignedTo.email': user.email },
          { 'assignedTo.id': user.id },
          { 'assignedTo.name': user.name },
          { 'assignedTo.id': 'all' },
          { 'assignedTo.name': 'All Employees' },
          { 'assignedTo.email': 'all@team.dev' },
          { userId: user.id }
        ]
      });
    }

    if (req.query.priority && req.query.priority !== 'all') {
      conditions.push({ priority: req.query.priority });
    }

    if (req.query.status && req.query.status !== 'all') {
      if (req.query.status === 'completed') {
        conditions.push({ $or: [{ status: 'completed' }, { completed: true }] });
      } else if (req.query.status === 'in_progress') {
        conditions.push({ status: 'in_progress', completed: false });
      } else if (req.query.status === 'pending') {
        conditions.push({
          $and: [
            { completed: false },
            {
              $or: [
                { status: 'pending' },
                { status: { $exists: false } },
                { status: null }
              ]
            }
          ]
        });
      }
    }

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      conditions.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { 'assignedTo.name': searchRegex },
          { 'assignedTo.email': searchRegex }
        ]
      });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};

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
        role: user.role,
        source: 'MongoDB',
        data: tasks
      });
    }

    // Fallback in-memory store
    let filteredTasks = [...store.tasks];
    if (!isManager) {
      filteredTasks = filteredTasks.filter(t =>
        (t.assignedTo && (
          t.assignedTo.email === user.email ||
          t.assignedTo.id === user.id ||
          t.assignedTo.name === user.name ||
          t.assignedTo.id === 'all' ||
          t.assignedTo.name === 'All Employees' ||
          t.assignedTo.email === 'all@team.dev'
        )) ||
        t.userId === user.id
      );
    } else if (req.query.assignedTo && req.query.assignedTo !== 'all') {
      if (req.query.assignedTo === 'all_employees' || req.query.assignedTo === 'All Employees') {
        filteredTasks = filteredTasks.filter(t =>
          t.assignedTo && (
            t.assignedTo.id === 'all' ||
            t.assignedTo.name === 'All Employees' ||
            t.assignedTo.email === 'all@team.dev'
          )
        );
      } else {
        filteredTasks = filteredTasks.filter(t =>
          t.assignedTo && (
            t.assignedTo.email === req.query.assignedTo ||
            t.assignedTo.name === req.query.assignedTo ||
            t.assignedTo.id === req.query.assignedTo
          )
        );
      }
    }

    if (req.query.priority && req.query.priority !== 'all') {
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
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.assignedTo && t.assignedTo.name && t.assignedTo.name.toLowerCase().includes(q))
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
      role: user.role,
      source: 'In-Memory Fallback',
      data: paginatedTasks
    });
  } catch (err) {
    next(err);
  }
};

// 2. GET /api/tasks/:id — Retrieve single task
const getTaskById = async (req, res, next) => {
  try {
    const user = req.user;

    if (isDbConnected()) {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Task with ID '${req.params.id}' not found`
        });
      }

      // Check permission
      if (user.role !== 'manager' && task.userId !== user.id && (!task.assignedTo || task.assignedTo.email !== user.email)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to view this task'
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
      t => t.id === numericId || t._id === req.params.id
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

// 3. POST /api/tasks — Create a new task (Managers can assign to any employee)
const createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority, status, assignedTo } = req.body;
    const user = req.user;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title is required'
      });
    }

    // Strict status & completed state consistency
    let computedStatus = status || (completed ? 'completed' : 'pending');
    let isCompleted = computedStatus === 'completed';

    // Parse assignee object
    let taskAssignee = {
      id: '',
      name: 'Unassigned',
      email: ''
    };

    if (assignedTo && typeof assignedTo === 'object') {
      taskAssignee = {
        id: assignedTo.id || '',
        name: assignedTo.name || 'Unassigned',
        email: assignedTo.email || ''
      };
    } else if (typeof assignedTo === 'string' && assignedTo.trim()) {
      taskAssignee = {
        id: '',
        name: assignedTo.trim(),
        email: ''
      };
    } else if (user.role === 'employee') {
      // Default to self for employee
      taskAssignee = {
        id: user.id || '',
        name: user.name || 'Employee',
        email: user.email || ''
      };
    }

    const taskAssigner = {
      id: user.id || '',
      name: user.name || (user.role === 'manager' ? 'Manager' : 'User'),
      email: user.email || ''
    };

    if (isDbConnected()) {
      const newTask = await Task.create({
        userId: user.id,
        title: title.trim(),
        description: description ? description.trim() : '',
        completed: isCompleted,
        status: computedStatus,
        priority: priority || 'medium',
        assignedTo: taskAssignee,
        assignedBy: taskAssigner
      });

      console.log(`\n========================================`);
      console.log(`🍃 MONGODB NOTIFICATION: Task Created with Role: ${user.role}!`);
      console.log(`   ID: ${newTask._id} | Assigned To: "${taskAssignee.name}" | Status: ${newTask.status}`);
      console.log(`========================================\n`);

      return res.status(201).json({
        success: true,
        message: `Task created and assigned to ${taskAssignee.name}`,
        source: 'MongoDB',
        data: newTask
      });
    }

    // Memory store fallback
    const newTask = {
      id: store.nextId(),
      _id: `mem-${Date.now()}`,
      userId: user.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: isCompleted,
      status: computedStatus,
      priority: priority || 'medium',
      assignedTo: taskAssignee,
      assignedBy: taskAssigner,
      createdAt: new Date().toISOString()
    };
    store.tasks.unshift(newTask);

    return res.status(201).json({
      success: true,
      message: `Task created and assigned to ${taskAssignee.name} (Memory Fallback)`,
      source: 'In-Memory Fallback',
      data: newTask
    });
  } catch (err) {
    next(err);
  }
};

// 4. PUT /api/tasks/:id — Update task (enforces status workflow rules)
const updateTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority, status, assignedTo } = req.body;
    const user = req.user;

    const updateData = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (description !== undefined) updateData.description = String(description).trim();
    if (priority !== undefined) updateData.priority = priority;

    // Strict status transition logic:
    // If status is set to 'completed', completed MUST be true.
    // If status is 'in_progress' or 'pending', completed MUST be false.
    if (status !== undefined) {
      updateData.status = status;
      updateData.completed = status === 'completed';
    } else if (completed !== undefined) {
      updateData.completed = Boolean(completed);
      updateData.status = completed ? 'completed' : 'pending';
    }

    if (assignedTo !== undefined) {
      if (typeof assignedTo === 'object') {
        updateData.assignedTo = assignedTo;
      } else if (typeof assignedTo === 'string') {
        updateData.assignedTo = { name: assignedTo, email: '', id: '' };
      }
    }

    if (isDbConnected()) {
      // Find existing task
      const existingTask = await Task.findById(req.params.id);
      if (!existingTask) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Task with ID '${req.params.id}' not found`
        });
      }

      // Check permission: Manager can update any task; Employee can update tasks assigned to them or to 'All Employees'
      const isEmployeeAssigned =
        existingTask.assignedTo &&
        (existingTask.assignedTo.email === user.email ||
         existingTask.assignedTo.id === user.id ||
         existingTask.assignedTo.name === user.name ||
         existingTask.assignedTo.id === 'all' ||
         existingTask.assignedTo.name === 'All Employees' ||
         existingTask.assignedTo.email === 'all@team.dev');
      const isCreator = existingTask.userId === user.id;

      if (user.role !== 'manager' && !isEmployeeAssigned && !isCreator) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update tasks assigned to you'
        });
      }

      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      console.log(`\n========================================`);
      console.log(`🍃 MONGODB NOTIFICATION: Task Updated!`);
      console.log(`   ID: ${updatedTask._id} | Status: ${updatedTask.status} | Completed: ${updatedTask.completed}`);
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
    const index = store.tasks.findIndex(
      t => t.id === numericId || t._id === req.params.id
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
    if (assignedTo !== undefined) task.assignedTo = updateData.assignedTo;

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

// 5. DELETE /api/tasks/:id — Delete task (Manager can delete any; Employee can delete own)
const deleteTask = async (req, res, next) => {
  try {
    const user = req.user;

    if (isDbConnected()) {
      const existingTask = await Task.findById(req.params.id);
      if (!existingTask) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Task with ID '${req.params.id}' not found`
        });
      }

      if (user.role !== 'manager' && existingTask.userId !== user.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only managers can delete assigned team tasks'
        });
      }

      const deletedTask = await Task.findByIdAndDelete(req.params.id);

      console.log(`\n========================================`);
      console.log(`🚨 MONGODB NOTIFICATION: Task Deleted!`);
      console.log(`   Deleted ID: ${deletedTask._id} | Deleted by: ${user.name || user.email}`);
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
    const index = store.tasks.findIndex(
      t => t.id === numericId || t._id === req.params.id
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
