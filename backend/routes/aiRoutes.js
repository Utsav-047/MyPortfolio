// ============================================================================
// Practical 13: AI API Integration Routes
// ============================================================================

const express = require('express');
const {
  generateTaskDescription,
  suggestTaskPriority,
  breakdownTaskIntoSteps,
  getAiStatus
} = require('../controllers/aiController');

const router = express.Router();

// 1. Telemetry & AI Status endpoint
router.get('/status', getAiStatus);

// 2. Auto-generate task description from title (Syllabus Requirement)
router.post('/generate-description', generateTaskDescription);

// 3. AI Priority analysis & effort estimation
router.post('/suggest-priority', suggestTaskPriority);

// 4. Subtasks breakdown generator
router.post('/breakdown', breakdownTaskIntoSteps);

module.exports = router;
