import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide name'],
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
      required: [true, 'Please provide mobile number'],
      trim: true,
    },
    subject: {
      type: String,
      default: 'General Inquiry / Greenfield Project Assistance',
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide your message / project brief'],
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied'],
      default: 'unread',
    },
    notes: {
      type: String,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

const ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactMessageSchema);
export default ContactMessage;
