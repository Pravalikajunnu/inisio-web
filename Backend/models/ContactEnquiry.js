import mongoose from 'mongoose';

const contactEnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email address'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    company: {
      type: String,
      default: '',
      trim: true,
    },
    subject: {
      type: String,
      default: 'General Greenfield Project Enquiry',
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide your message'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'In Progress', 'Closed', 'Spam'],
      default: 'New',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    assignedTo: {
      type: String,
      default: 'Senior Project Advisory Desk',
      trim: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      default: 'Website Contact Us Form',
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes for rapid query filtering
contactEnquirySchema.index({ name: 'text', email: 'text', phone: 'text', company: 'text', subject: 'text' });
contactEnquirySchema.index({ status: 1, createdAt: -1 });
contactEnquirySchema.index({ isArchived: 1 });

const ContactEnquiry = mongoose.models.ContactEnquiry || mongoose.model('ContactEnquiry', contactEnquirySchema);
export default ContactEnquiry;
