import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
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
    dscrEstimate: {
      type: Number,
      default: 0,
      min: 0,
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
      default: 'In Appraisal',
    },
    photoOrLogo: {
      type: String,
      default: '',
    },
    dprFile: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    cmaFile: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    assignedTeam: {
      type: String,
      default: '',
    },
    assignedRole: {
      type: String,
      default: '',
    },
    assignedAt: {
      type: String,
      default: '',
    },
    timelineDate: {
      type: String,
      default: '',
    },
    timelineTime: {
      type: String,
      default: '',
    },
    lastEditedBy: {
      type: String,
      default: '',
    },
    lastEditedAt: {
      type: String,
      default: '',
    },
    editHistory: {
      type: Array,
      default: [],
    },
    riskProfileData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    commercialData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    promotersList: {
      type: Array,
      default: [],
    },
    customCostComponents: {
      type: Array,
      default: [],
    },
    customFinanceComponents: {
      type: Array,
      default: [],
    },
    uploadedDocuments: {
      type: Array,
      default: [],
    },
    successProbability: {
      type: Number,
      default: 25,
    },
    isFunded: {
      type: Boolean,
      default: false,
    },
    dprAssignedTo: {
      type: String,
      default: '',
    },
    consultationAssignedTo: {
      type: String,
      default: '',
    },
    consultationStatus: {
      type: String,
      enum: ['New', 'In Progress', 'Customer Declined', 'Completed', 'Pending'],
      default: 'New',
    },
    consultationNotes: {
      type: String,
      default: '',
    },
    assessmentCompleted: {
      type: Boolean,
      default: false,
    },
    documentsUploaded: {
      type: Boolean,
      default: false,
    },
    dprCompleted: {
      type: Boolean,
      default: false,
    },
    bankApplicationSubmitted: {
      type: Boolean,
      default: false,
    },
    membershipTier: {
      type: String,
      default: 'Standard',
    },
    bankAppliedAt: {
      type: String,
      default: '',
    },
    loanApprovedAt: {
      type: String,
      default: '',
    },
    fundingDisbursedAt: {
      type: String,
      default: '',
    },
    financials: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
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
