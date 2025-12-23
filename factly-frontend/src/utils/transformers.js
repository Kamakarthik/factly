// Transform a single fact from MongoDB format to frontend format
export const transformFact = (fact, fallbackProfiles = null) => ({
  id: fact._id,
  text: fact.text,
  source: fact.source,
  category: fact.category,
  user_id: fact.userId,
  votesInteresting: fact.votesInteresting,
  votesMindBlowing: fact.votesMindBlowing,
  votesFalse: fact.votesFalse,
  created_at: fact.createdAt,
  userVote: fact.userVote || null,
  profiles: fact.user
    ? {
        username: fact.user.username,
        avatar_url: fact.user.avatarUrl,
      }
    : fallbackProfiles,
});

// Transform multiple facts from MongoDB format to frontend format
export const transformFacts = (facts, fallbackProfiles = null) =>
  facts.map((fact) => transformFact(fact, fallbackProfiles));
