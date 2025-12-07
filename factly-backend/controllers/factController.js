const Fact = require('../models/factModel');
const User = require('../models/userModel');
const Vote = require('../models/voteModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// Get all facts with filtering, sorting, pagination
exports.getAllFacts = catchAsync(async (req, res, next) => {
  // Build query
  const features = new APIFeatures(Fact.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Execute query
  const facts = await features.query;

  // If user is logged in, attach their votes to each fact
  if (req.user) {
    const factIds = facts.map((f) => f._id);
    const userVotes = await Vote.find({
      userId: req.user.id,
      factId: { $in: factIds },
    });

    // Create a map of factId -> voteType
    const voteMap = {};
    userVotes.forEach((vote) => {
      voteMap[vote.factId.toString()] = vote.voteType;
    });

    // Attach userVote to each fact
    const factsWithVotes = facts.map((fact) => {
      const factObj = fact.toObject();
      factObj.userVote = voteMap[fact._id.toString()] || null;
      return factObj;
    });

    return res.status(200).json({
      status: 'success',
      results: factsWithVotes.length,
      data: {
        facts: factsWithVotes,
      },
    });
  }

  res.status(200).json({
    status: 'success',
    results: facts.length,
    data: {
      facts,
    },
  });
});

// Get single fact by ID
exports.getFact = catchAsync(async (req, res, next) => {
  const fact = await Fact.findById(req.params.id);

  if (!fact) {
    return next(new AppError('No fact found with that ID', 404));
  }

  // Attach user's vote if logged in
  if (req.user) {
    const userVote = await Vote.findOne({
      userId: req.user.id,
      factId: fact._id,
    });
    const factObj = fact.toObject();
    factObj.userVote = userVote ? userVote.voteType : null;

    return res.status(200).json({
      status: 'success',
      data: {
        fact: factObj,
      },
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      fact,
    },
  });
});

// Create new fact
exports.createFact = catchAsync(async (req, res, next) => {
  const { text, source, category } = req.body;

  const newFact = await Fact.create({
    text,
    source,
    category,
    userId: req.user.id,
  });

  // Populate user data
  await newFact.populate('user', 'username avatarUrl');

  res.status(201).json({
    status: 'success',
    data: {
      fact: newFact,
    },
  });
});

// Update fact (only by owner or admin)
exports.updateFact = catchAsync(async (req, res, next) => {
  const fact = await Fact.findById(req.params.id);

  if (!fact) {
    return next(new AppError('No fact found with that ID', 404));
  }

  // Check if user is owner or admin
  if (fact.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to update this fact', 403)
    );
  }

  const { text, source, category } = req.body;

  const updatedFact = await Fact.findByIdAndUpdate(
    req.params.id,
    { text, source, category },
    {
      new: true,
      runValidators: true,
    }
  );

  // Attach user's vote to response
  const userVote = await Vote.findOne({
    userId: req.user.id,
    factId: updatedFact._id,
  });

  const factObj = updatedFact.toObject();
  factObj.userVote = userVote ? userVote.voteType : null;

  res.status(200).json({
    status: 'success',
    data: {
      fact: factObj,
    },
  });
});

// Delete fact (only by owner or admin)
exports.deleteFact = catchAsync(async (req, res, next) => {
  const fact = await Fact.findById(req.params.id);

  if (!fact) {
    return next(new AppError('No fact found with that ID', 404));
  }

  // Check if user is owner or admin
  if (fact.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to delete this fact', 403)
    );
  }

  // Delete the fact
  await Fact.findByIdAndDelete(req.params.id);

  // Also delete all votes for this fact
  await Vote.deleteMany({ factId: req.params.id });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Vote on a fact
exports.voteFact = catchAsync(async (req, res, next) => {
  const { voteType } = req.body;

  if (
    !['votesInteresting', 'votesMindBlowing', 'votesFalse'].includes(voteType)
  ) {
    return next(new AppError('Invalid vote type', 400));
  }

  const fact = await Fact.findById(req.params.id);

  if (!fact) {
    return next(new AppError('No fact found with that ID', 404));
  }

  // Check if user already voted on this fact
  const existingVote = await Vote.findOne({
    userId: req.user.id,
    factId: fact._id,
  });

  // If user already voted
  if (existingVote) {
    const oldVoteType = existingVote.voteType;

    // If clicking the same vote type, remove vote (unvote)
    if (oldVoteType === voteType) {
      await Vote.findByIdAndDelete(existingVote._id);
      fact[voteType] = Math.max(0, fact[voteType] - 1);
      await fact.save();
      await fact.populate('user', 'username avatarUrl');

      const factObj = fact.toObject();
      factObj.userVote = null;

      return res.status(200).json({
        status: 'success',
        data: {
          fact: factObj,
        },
      });
    }
    // Switching vote type
    else {
      // Decrement old vote
      fact[oldVoteType] = Math.max(0, fact[oldVoteType] - 1);

      // Increment new vote
      fact[voteType] += 1;

      // Update vote record
      existingVote.voteType = voteType;
      await existingVote.save();
      await fact.save();
      await fact.populate('user', 'username avatarUrl');

      const factObj = fact.toObject();
      factObj.userVote = voteType;

      return res.status(200).json({
        status: 'success',
        data: {
          fact: factObj,
        },
      });
    }
  }

  // No existing vote - create new vote
  await Vote.create({
    userId: req.user.id,
    factId: fact._id,
    voteType,
  });

  fact[voteType] += 1;
  await fact.save();
  await fact.populate('user', 'username avatarUrl');

  const factObj = fact.toObject();
  factObj.userVote = voteType;

  res.status(200).json({
    status: 'success',
    data: {
      fact: factObj,
    },
  });
});

// Get facts by category
exports.getFactsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;

  const features = new APIFeatures(Fact.find({ category }), req.query)
    .sort()
    .limitFields()
    .paginate();

  const facts = await features.query;

  // Attach user votes if logged in
  if (req.user) {
    const factIds = facts.map((f) => f._id);
    const userVotes = await Vote.find({
      userId: req.user.id,
      factId: { $in: factIds },
    });

    const voteMap = {};
    userVotes.forEach((vote) => {
      voteMap[vote.factId.toString()] = vote.voteType;
    });

    const factsWithVotes = facts.map((fact) => {
      const factObj = fact.toObject();
      factObj.userVote = voteMap[fact._id.toString()] || null;
      return factObj;
    });

    return res.status(200).json({
      status: 'success',
      results: factsWithVotes.length,
      data: {
        facts: factsWithVotes,
      },
    });
  }

  res.status(200).json({
    status: 'success',
    results: facts.length,
    data: {
      facts,
    },
  });
});

// Get user's facts
exports.getUserFacts = catchAsync(async (req, res, next) => {
  const userId = req.params.userId || req.user.id;

  // Check if user exists
  const userExists = await User.findById(userId);
  if (!userExists) {
    return next(new AppError('User not found', 404));
  }
  const facts = await Fact.find({ userId }).sort('-createdAt');

  // Attach current user's votes if viewing someone else's profile
  if (req.user && req.user.id !== userId) {
    const factIds = facts.map((f) => f._id);
    const userVotes = await Vote.find({
      userId: req.user.id,
      factId: { $in: factIds },
    });

    const voteMap = {};
    userVotes.forEach((vote) => {
      voteMap[vote.factId.toString()] = vote.voteType;
    });

    const factsWithVotes = facts.map((fact) => {
      const factObj = fact.toObject();
      factObj.userVote = voteMap[fact._id.toString()] || null;
      return factObj;
    });

    return res.status(200).json({
      status: 'success',
      results: factsWithVotes.length,
      data: {
        facts: factsWithVotes,
      },
    });
  }

  res.status(200).json({
    status: 'success',
    results: facts.length,
    data: {
      facts,
    },
  });
});

// Get fact statistics
exports.getFactStats = catchAsync(async (req, res, next) => {
  const stats = await Fact.aggregate([
    {
      $group: {
        _id: '$category',
        numFacts: { $sum: 1 },
        avgInteresting: { $avg: '$votesInteresting' },
        avgMindBlowing: { $avg: '$votesMindBlowing' },
        avgFalse: { $avg: '$votesFalse' },
      },
    },
    {
      $sort: { numFacts: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

// Get facts that the current user has voted on
exports.getVotedFacts = catchAsync(async (req, res, next) => {
  // Find all votes by this user
  const userVotes = await Vote.find({ userId: req.user.id }).sort('-createdAt');

  if (userVotes.length === 0) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: {
        facts: [],
      },
    });
  }

  // Get all fact IDs that user voted on
  const factIds = userVotes.map((vote) => vote.factId);

  // Fetch all those facts
  const facts = await Fact.find({ _id: { $in: factIds } }).sort('-createdAt');

  // Create a map of factId -> voteType
  const voteMap = {};
  userVotes.forEach((vote) => {
    voteMap[vote.factId.toString()] = vote.voteType;
  });

  // Attach userVote to each fact
  const factsWithVotes = facts.map((fact) => {
    const factObj = fact.toObject();
    factObj.userVote = voteMap[fact._id.toString()] || null;
    return factObj;
  });

  res.status(200).json({
    status: 'success',
    results: factsWithVotes.length,
    data: {
      facts: factsWithVotes,
    },
  });
});
