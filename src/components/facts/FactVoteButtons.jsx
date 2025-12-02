import { useState, useEffect } from 'react';
import supabase from '../../utils/supabase';
import './FactVoteButtons.css';

const FactVoteButtons = ({ fact, setFacts, showDeleteOnly }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  // Get initial vote state from localStorage
  const getStoredVote = () => {
    try {
      const stored = localStorage.getItem(`vote_${fact.id}`);
      return stored || null;
    } catch {
      return null;
    }
  };

  const [userVote, setUserVote] = useState(getStoredVote);

  // Save vote to localStorage whenever it changes
  useEffect(() => {
    try {
      if (userVote) {
        localStorage.setItem(`vote_${fact.id}`, userVote);
      } else {
        localStorage.removeItem(`vote_${fact.id}`);
      }
    } catch (error) {
      console.error('Failed to save vote:', error);
    }
  }, [userVote, fact.id]);

  // Handle vote button clicks
  const handleVote = async (columnName) => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      const updates = {};
      // Case 1: user clicks the same vote again → undo
      if (userVote === columnName) {
        updates[columnName] = Math.max(0, fact[columnName] - 1);
        setUserVote(null);
      }
      // Case 2: user switches vote
      else {
        updates[columnName] = fact[columnName] + 1;
        if (userVote) {
          updates[userVote] = Math.max(0, fact[userVote] - 1);
        }
        setUserVote(columnName);
      }

      const { data: updatedFact, error } = await supabase
        .from('facts')
        .update(updates)
        .eq('id', fact.id)
        .select('*,profiles(username,avatar_url)')
        .single();

      if (error) throw error;

      // Update local state so UI shows new votes immediately
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact : f))
      );
    } catch (error) {
      console.error('Vote error:', error);
      alert('Failed to update vote. Please try again.');
      // Revert optimistic update
      setUserVote(userVote);
    } finally {
      setIsUpdating(false);
    }
  };

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
