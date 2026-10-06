const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    // Owner — links this task to the authenticated Google user
    userId: {
      type: String,
      required: [true, 'userId is required'],
      index: true
    },
    assignedTo: {
      id: { type: String, default: '' },
      name: { type: String, default: 'Unassigned' },
      email: { type: String, default: '' }
    },
    assignedBy: {
      id: { type: String, default: '' },
      name: { type: String, default: '' },
      email: { type: String, default: '' }
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    completed: {
      type: Boolean,
      default: false,
      index: true
    },
    status: {
      type: String,
      lowercase: true,
      enum: {
        values: ['pending', 'in_progress', 'completed'],
        message: '{VALUE} is not a valid status. Allowed values: pending, in_progress, completed'
      },
      default: 'pending',
      index: true
    },
    priority: {
      type: String,
      lowercase: true,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority. Allowed values: low, medium, high'
      },
      default: 'medium',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound / sorting index matching Compass (createdAt_-1)
taskSchema.index({ createdAt: -1 });

// Pre-save hook: Automatically trim whitespace and sync status/completed
taskSchema.pre('save', function () {
  if (this.title) {
    this.title = this.title.trim();
  }
  if (this.status === 'completed') {
    this.completed = true;
  } else if (this.status === 'in_progress') {
    this.completed = false;
  } else if (this.status === 'pending') {
    this.completed = false;
  } else if (this.completed) {
    this.status = 'completed';
  } else {
    this.status = 'pending';
    this.completed = false;
  }
});

module.exports = mongoose.model('Task', taskSchema);
