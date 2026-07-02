const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['general', 'ai_config', 'alert_rules', 'notification', 'sensor', 'security', 'integration', 'backup'],
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    label: { type: String, default: '' },
    description: { type: String, default: '' },
    dataType: {
      type: String,
      enum: ['string', 'number', 'boolean', 'json', 'array'],
      default: 'string',
    },
    isActive: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

settingSchema.index({ category: 1 });
settingSchema.index({ key: 1 });

module.exports = mongoose.model('Setting', settingSchema);
