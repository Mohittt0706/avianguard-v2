const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Citizen',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    alert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert',
    },
    channel: {
      type: String,
      enum: ['SMS', 'WhatsApp', 'Email', 'Push', 'InApp'],
      required: true,
    },
    type: {
      type: String,
      enum: ['alert', 'system', 'update', 'test'],
      default: 'alert',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
      default: 'pending',
    },
    deliveredAt: Date,
    readAt: Date,
    errorMessage: { type: String },
    retryCount: { type: Number, default: 0 },
    metadata: mongoose.Schema.Types.Mixed,
    sentAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ citizen: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ alert: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
