const Vote = require('../models/voteModel');

// Attaches user's vote information to multiple facts
exports.attachUserVotesToFacts = async (facts, userId) => {
  if (!userId || !facts || facts.length === 0) {
    return facts;
  }

  // If user is logged in, attach their votes to each fact
  const factIds = facts.map((f) => f._id);
  const userVotes = await Vote.find({
    userId: userId,
    factId: { $in: factIds },
  });

  // Create a map of factId -> voteType
  const voteMap = {};
  userVotes.forEach((vote) => {
    voteMap[vote.factId.toString()] = vote.voteType;
  });

  // Attach userVote to each fact
  return facts.map((fact) => {
    const factObj = fact.toObject();
    factObj.userVote = voteMap[fact._id.toString()] || null;
    return factObj;
  });
};

// Attaches user's vote to a single fact
exports.attachUserVoteToFact = async (fact, userId) => {
  if (!userId || !fact) return fact;

  // Attach user's vote if logged in
  const userVote = await Vote.findOne({
    userId: userId,
    factId: fact._id,
  });

  const factObj = fact.toObject();
  factObj.userVote = userVote ? userVote.voteType : null;

  return factObj;
};
