const mongoose = require('mongoose');
const factSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'A fact must have text'],
      trim: true,
      maxlength: [200, 'A fact must have less than 200 characters'],
    },
    source: {
      type: String,
      required: [true, 'A fact must have a source'],
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Source must be a valid URL',
      },
    },
    category: {
      type: String,
      required: [true, 'A fact must belong to a category'],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A fact must belong to a user'],
    },
    votesInteresting: {
      type: Number,
      default: 0,
      min: [0, 'Votes cannot be negative'],
    },
    votesMindBlowing: {
      type: Number,
      default: 0,
      min: [0, 'Votes cannot be negative'],
    },
    votesFalse: {
      type: Number,
      default: 0,
      min: [0, 'Votes cannot be negative'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
factSchema.index({ category: 1, createdAt: -1 });
factSchema.index({ userId: 1, createdAt: -1 });
factSchema.index({ votesInteresting: -1 });
factSchema.index({ votesMindBlowing: -1 });
factSchema.index({ votesFalse: -1 });

// Virtual populate user info
factSchema.virtual('user', {
  ref: 'User',
  foreignField: '_id',
  localField: 'userId',
  justOne: true,
});

// Populate user data on queries
factSchema.pre(/^find/, function () {
  this.populate({
    path: 'user',
    select: 'username avatarUrl',
  });
});

const Fact = mongoose.model('Fact', factSchema);

module.exports = Fact;
