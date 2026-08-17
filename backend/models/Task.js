const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
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

// Pre-save hook: Automatically trim whitespace from title field
taskSchema.pre('save', function () {
  if (this.title) {
    this.title = this.title.trim();
  }
});

module.exports = mongoose.model('Task', taskSchema);
