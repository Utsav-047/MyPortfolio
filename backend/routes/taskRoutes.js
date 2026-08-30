const express = require('express');
const { validateContentType, validateTaskId } = require('../middleware/validators');
const { protect } = require('../middleware/authMiddleware');
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const router = express.Router();

// All task routes are protected — require a valid JWT (Google Auth)
router.use(protect);

router.get('/', getAllTasks);
router.get('/:id', validateTaskId, getTaskById);
router.post('/', validateContentType, createTask);
router.put('/:id', validateTaskId, validateContentType, updateTask);
router.delete('/:id', validateTaskId, deleteTask);

module.exports = router;
