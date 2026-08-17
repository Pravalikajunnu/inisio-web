import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    promoterName: {
      type: String,
      default: 'Promoter',
    },
    email: {
      type: String,
      default: '',
    },
    mobile: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
    },
    projectCostCr: {
      type: Number,
      required: [true, 'Project cost in Cr is required'],
    },
    equityPercent: {
      type: Number,
      default: 25,
    },
    landStatus: {
      type: String,
      enum: ['owned', 'leased', 'identified', 'not_started'],
      default: 'identified',
    },
    collateralStatus: {
      type: String,
      default: '',
    },
    promoterExpYears: {
      type: Number,
      default: 5,
    },
    locationState: {
      type: String,
      default: '',
    },
    dprReady: {
      type: Boolean,
      default: false,
    },
    targetBankType: {
      type: String,
      enum: ['PSU', 'Private', 'NBFC', 'Undecided'],
      default: 'PSU',
    },
    // Calculated Underwriting Outputs
    feasibilityScore: {
      type: Number,
      default: 80,
    },
    bankabilityGrade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C'],
      default: 'A',
    },
    maxLoanAmountCr: {
      type: Number,
      default: 0,
    },
    estInterestRate: {
      type: String,
      default: '9.25% - 10.50%',
    },
    dscrEstimate: {
      type: Number,
      default: 1.5,
    },
    paybackYears: {
      type: Number,
      default: 4.5,
    },
    keyRisks: {
      type: [String],
      default: [],
    },
    strengthPoints: {
      type: [String],
      default: [],
    }
  },
  {
    timestamps: true,
  }
);

const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema);
export default Assessment;
