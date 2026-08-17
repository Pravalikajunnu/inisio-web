import mongoose from 'mongoose';

const industrySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    iconName: {
      type: String,
      default: 'Building2',
    },
    description: {
      type: String,
      required: true,
    },
    avgLoanSize: {
      type: String,
      default: '₹5 Cr - ₹50 Cr',
    },
    feasibilityRate: {
      type: String,
      default: '85%',
    },
    keyFactors: [String],
    popularRegions: [String],
    overview: String,
    projectCostRange: String,
    fundingStructure: String,
    dscrNorms: String,
    roiAndPayback: String,
    subsidiesAndSchemes: [String],
    eligibleBanks: [String],
    keyRisks: [String],
    imageUrl: String,
  },
  {
    timestamps: true,
  }
);

const Industry = mongoose.models.Industry || mongoose.model('Industry', industrySchema);
export default Industry;
