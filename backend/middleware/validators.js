const mongoose = require('mongoose');

const validateContentType = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'Content-Type header must be application/json'
      });
    }
  }
  next();
};

const validateTaskId = (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: 'Invalid Task ID',
      message: 'Task ID must be a valid 24-character hexadecimal MongoDB ObjectId'
    });
  }
  next();
};

module.exports = {
  validateContentType,
  validateTaskId
};
