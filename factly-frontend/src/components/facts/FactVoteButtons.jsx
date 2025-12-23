import { useState } from 'react';
import API from '../../utils/api';
import { transformFact } from '../../utils/transformers';
import './FactVoteButtons.css';

const FactVoteButtons = ({ fact, setFacts, showDeleteOnly }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // Get user's vote from fact data (comes from backend)
  const userVote = fact.userVote || null;

  // Handle vote button clicks
  const handleVote = async (voteType) => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      // Backend handles all logic: unvote, vote, switch
      const response = await API.patch(`/facts/${fact.id}/vote`, {
        voteType,
      });

      const updatedFact = response.data.data.fact;

      // Transform MongoDB response
      const transformedFact = transformFact(updatedFact, fact.profiles);

      // Update UI
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? transformedFact : f))
      );
    } catch (error) {
      console.error('Vote error:', error);
      alert(
        error.response?.data?.message ||
          'Failed to update vote. Please try again.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Read-only view for profile page
  if (showDeleteOnly) {
    return (
      <div className="vote-buttons">
        <span className="vote-badge">👍 {fact.votesInteresting}</span>
        <span className="vote-badge">🤯 {fact.votesMindBlowing}</span>
        <span className="vote-badge">⛔️ {fact.votesFalse}</span>
      </div>
    );
  }

  const voteButtons = [
    { type: 'votesInteresting', emoji: '👍', color: '#3b82f6' },
    { type: 'votesMindBlowing', emoji: '🤯', color: '#16a34a' },
    { type: 'votesFalse', emoji: '⛔️', color: '#ef4444' },
  ];

  return (
    <div className="vote-buttons">
      {voteButtons.map(({ type, emoji, color }) => (
        <button
          key={type}
          onClick={() => handleVote(type)}
          disabled={isUpdating}
          style={{
            backgroundColor: userVote === type ? color : '',
          }}
        >
          {emoji} {fact[type]}
        </button>
      ))}
    </div>
  );
};

export default FactVoteButtons;
