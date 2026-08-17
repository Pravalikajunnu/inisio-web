import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true,
    },
    companyName: {
      type: String,
      default: '',
      trim: true,
    },
    industry: {
      type: String,
      default: 'General Greenfield Project',
      trim: true,
    },
    projectCostCr: {
      type: String,
      default: '',
    },
    preferredDate: {
      type: String,
      default: '',
    },
    preferredSlot: {
      type: String,
      default: 'Morning (10:00 AM - 1:00 PM)',
    },
    additionalNotes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    assignedAdvisor: {
      type: String,
      default: 'Senior Debt Syndication Expert',
    },
    feedback: {
      type: String,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

const Consultation = mongoose.models.Consultation || mongoose.model('Consultation', consultationSchema);
export default Consultation;
