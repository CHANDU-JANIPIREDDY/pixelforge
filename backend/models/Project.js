import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    deadline: {
      type: Date,
      required: [true, 'Project deadline is required'],
      validate: {
        validator: function (value) {
          return value instanceof Date && !isNaN(value.getTime());
        },
        message: 'Invalid date format',
      },
    },
    status: {
      type: String,
      enum: ['Active', 'Completed'],
      default: 'Active',
    },
    projectLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project lead is required'],
    },
    assignedDevelopers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    documents: [
      {
        filename: {
          type: String,
          required: true,
        },
        originalName: {
          type: String,
          required: true,
        },
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ status: 1, deadline: 1 });
projectSchema.index({ projectLead: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
