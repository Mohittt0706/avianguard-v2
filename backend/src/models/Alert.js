const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    wetland: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wetland',
      required: true,
    },
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SensorStation',
    },
    type: {
      type: String,
      enum: ['water_level', 'temperature', 'ph', 'turbidity', 'rainfall', 'flood', 'drought', 'poaching', 'encroachment', 'pollution', 'fire', 'system', 'test'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical', 'emergency'],
      default: 'info',
    },
    title: {
      type: String,
      required: [true, 'Alert title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Alert message is required'],
    },
    value: { type: Number },
    threshold: { type: Number },
    location: {
      latitude: Number,
      longitude: Number,
    },
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved', 'dismissed'],
      default: 'active',
    },
    acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    acknowledgedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
    notificationSent: { type: Boolean, default: false },
    notifiedCount: { type: Number, default: 0 },
    source: {
      type: String,
      enum: ['sensor', 'system', 'manual', 'citizen_report', 'ai_prediction'],
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ wetland: 1, createdAt: -1 });
alertSchema.index({ status: 1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ type: 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
