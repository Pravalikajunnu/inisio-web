import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      default: '',
    },
    shortDesc: {
      type: String,
      required: true,
    },
    fullDesc: {
      type: String,
      required: true,
    },
    deliverables: [String],
    iconName: {
      type: String,
      default: 'FileCheck',
    },
    turnaroundTime: {
      type: String,
      default: '5 - 7 Days',
    },
    imageUrl: String,
    active: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
export default Service;
