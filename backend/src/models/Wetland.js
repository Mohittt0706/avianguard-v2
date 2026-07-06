const mongoose = require('mongoose');

const wetlandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Wetland name is required'],
      unique: true,
      trim: true,
    },
    localName: {
      type: String,
      trim: true,
      default: '',
    },
    description: { type: String, default: '' },
    district: { type: String, trim: true, required: true },
    state: { type: String, trim: true, default: '' },
    coordinates: {
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    area: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['lake', 'marsh', 'swamp', 'estuary', 'lagoon', 'reservoir', 'other'],
      default: 'lake',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'monitoring'],
      default: 'active',
    },
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      default: 'low',
    },
    sensorStationCount: { type: Number, default: 0 },
    citizenCount: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

wetlandSchema.index({ district: 1 });
wetlandSchema.index({ status: 1 });
wetlandSchema.index({ name: 'text', district: 'text' });

module.exports = mongoose.model('Wetland', wetlandSchema);
