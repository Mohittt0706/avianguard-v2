const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'custom', 'incident', 'analytics'],
      required: true,
    },
    format: {
      type: String,
      enum: ['PDF', 'CSV', 'Excel', 'JSON'],
      default: 'PDF',
    },
    wetland: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wetland',
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dateRange: {
      start: Date,
      end: Date,
    },
    data: mongoose.Schema.Types.Mixed,
    summary: { type: String },
    fileUrl: { type: String },
    fileSize: { type: Number },
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'generating',
    },
    parameters: mongoose.Schema.Types.Mixed,
    errorMessage: { type: String },
    scheduledAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ wetland: 1, createdAt: -1 });
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ type: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
