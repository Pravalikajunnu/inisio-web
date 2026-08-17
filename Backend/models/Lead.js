import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please add promoter full name'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Please add mobile number'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add email address'],
      trim: true,
      lowercase: true,
    },
    projectName: {
      type: String,
      default: 'Greenfield Project Proposal',
      trim: true,
    },
    industry: {
      type: String,
      default: 'Manufacturing & Industrial',
      trim: true,
    },
    location: {
      type: String,
      default: '',
    },
    totalCostCr: {
      type: mongoose.Schema.Types.Mixed,
      default: '10',
    },
    loanRequiredCr: {
      type: mongoose.Schema.Types.Mixed,
      default: '7.5',
    },
    feasibilityScore: {
      type: Number,
      default: 80,
    },
    bankabilityRating: {
      type: String,
      default: 'A',
    },
    source: {
      type: String,
      default: 'Web Portal Submission',
    },
    downloadedPDF: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
    promoterContribCr: {
      type: mongoose.Schema.Types.Mixed,
      default: '',
    },
    landStatus: {
      type: String,
      default: '',
    },
    collateralStatus: {
      type: String,
      default: '',
    },
    promoterExp: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'In Appraisal', 'DPR Ready', 'Sanctioned', 'Archived'],
      default: 'New',
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

const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);
export default Lead;
