import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    promoterName: {
      type: String,
      required: [true, 'Promoter name is required'],
      trim: true,
    },
    projectName: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry category is required'],
    },
    location: {
      type: String,
      default: 'India',
    },
    capexCr: {
      type: Number,
      required: true,
    },
    loanCr: {
      type: Number,
      required: true,
    },
    equityCr: {
      type: Number,
      default: 0,
    },
    dscr: {
      type: Number,
      default: 1.45,
    },
    feasibilityScore: {
      type: Number,
      default: 85,
    },
    bankabilityRating: {
      type: String,
      default: 'A',
    },
    subsidyEligible: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Audit', 'CA Approved', 'Bank Submitted', 'Sanctioned', 'Clarification Needed'],
      default: 'Pending Audit',
    },
    caReviewNotes: {
      type: String,
      default: '',
    },
    assignedCA: {
      type: String,
      default: 'CA Rajesh Sharma (FCA)',
    },
    assignedBank: {
      type: String,
      default: 'State Bank of India / Punjab National Bank',
    },
    sanctionDate: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
export default Project;
