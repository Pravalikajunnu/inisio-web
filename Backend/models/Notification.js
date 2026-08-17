import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['TEASER_DOWNLOAD', 'PROJECT_MODIFIED', 'ASSESSMENT_SUBMITTED', 'CONSULTATION_BOOKED', 'CA_AUDIT_UPDATE', 'LEAD_CREATED'],
      default: 'TEASER_DOWNLOAD',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    projectName: {
      type: String,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export default Notification;
