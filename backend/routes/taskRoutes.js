const express = require('express');
const { validateContentType, validateTaskId } = require('../middleware/validators');
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const router = express.Router();

router.get('/', getAllTasks);
router.get('/:id', validateTaskId, getTaskById);
router.post('/', validateContentType, createTask);
router.put('/:id', validateTaskId, validateContentType, updateTask);
router.delete('/:id', validateTaskId, deleteTask);

module.exports = router;
