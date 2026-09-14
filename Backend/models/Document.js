import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: {
      type: String,
      enum: ['Company KYC', 'Promoter KYC', 'DPR', 'Financial Model', 'Other Document'],
      required: true,
    },
    originalName: { type: String, required: true, trim: true },
    storageName: { type: String, required: true, unique: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: true }
);

const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);
export default Document;