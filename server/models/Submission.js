const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  teamName: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  score: {
    type: Number,
    default: 0 // Điểm số 10-9-8-7-6-5 tùy theo lần thử
  },
  attemptNumber: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  nextAttemptAllowed: {
    type: Date,
    default: null // Thời điểm được phép thử lại
  }
});

// Index để tìm kiếm nhanh
SubmissionSchema.index({ stationId: 1, teamName: 1 });

module.exports = mongoose.model('Submission', SubmissionSchema); 