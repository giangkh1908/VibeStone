import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  userIP: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'read', 'deleted'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Feedback', feedbackSchema); 