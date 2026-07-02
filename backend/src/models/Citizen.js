const mongoose = require('mongoose');

const citizenSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    dateOfBirth: String,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', ''],
      default: '',
    },
    state: { type: String, trim: true, default: '' },
    district: { type: String, trim: true, required: true },
    taluka: { type: String, trim: true, default: '' },
    village: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },
    nearbyWetland: { type: String, trim: true, default: '' },
    gpsLocation: { type: String, default: '' },
    distanceFromWetland: { type: String, default: '' },
    occupation: { type: String, default: '' },
    occupationOther: { type: String, default: '' },
    alertMethods: {
      type: [String],
      enum: ['SMS', 'WhatsApp', 'Email', 'Push'],
      default: ['SMS'],
    },
    alertTypes: {
      type: [String],
      default: [],
    },
    language: { type: String, default: 'English' },
    emergencyName: { type: String, default: '' },
    emergencyMobile: { type: String, default: '' },
    emergencyRelationship: { type: String, default: '' },
    agree: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'pending-verification', 'disabled'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
    approvedAt: Date,
    rejectedAt: Date,
    verificationRequestedAt: Date,
    lastAlertAt: Date,
    disabledAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

citizenSchema.index({ status: 1 });
citizenSchema.index({ district: 1 });
citizenSchema.index({ taluka: 1 });
citizenSchema.index({ village: 1 });
citizenSchema.index({ mobile: 1 });
citizenSchema.index({ nearbyWetland: 1 });
citizenSchema.index({ fullName: 'text', mobile: 'text', village: 'text', taluka: 'text' });

module.exports = mongoose.model('Citizen', citizenSchema);
