const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Vote must belong to a user'],
  },
  factId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Fact',
    required: [true, 'Vote must belong to a fact'],
  },
  voteType: {
    type: String,
    enum: ['votesInteresting', 'votesMindBlowing', 'votesFalse'],
    required: [true, 'Vote must have a type'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index: One user can only have ONE vote per fact
voteSchema.index({ userId: 1, factId: 1 }, { unique: true });

// Index for querying votes by fact
voteSchema.index({ factId: 1 });

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
