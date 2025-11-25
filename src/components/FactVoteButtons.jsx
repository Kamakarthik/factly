import { useState } from 'react';
import supabase from '../supabase';

const FactVoteButtons = ({ fact, setFacts }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [userVote, setUserVote] = useState(null);

  const handleVote = async (columnName) => {
    setIsUpdating(true);

    let updates = {};
    // Case 1: user clicks the same vote again → undo
    if (userVote === columnName) {
      updates[columnName] = fact[columnName] - 1;
      setUserVote(null);
    }
    // Case 2: user switches vote
    else {
      updates[columnName] = fact[columnName] + 1;
      if (userVote) {
        updates[userVote] = fact[userVote] - 1;
      }
      setUserVote(columnName);
    }

    const { data: updatedFact, error } = await supabase
      .from('facts')
      .update(updates)
      .eq('id', fact.id)
      .select();
    setIsUpdating(false);

    if (!error && updatedFact) {
      // Update local state so UI shows new votes
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
    } else {
      alert('There was a problem updating your vote');
    }
  };

  return (
    <div className="vote-buttons">
      <button
        onClick={() => handleVote('votesInteresting')}
        disabled={isUpdating}
        style={{
          backgroundColor: userVote === 'votesInteresting' ? '#3b82f6' : '',
        }}
      >
        👍 {fact.votesInteresting}
      </button>
      <button
        onClick={() => handleVote('votesMindBlowing')}
        disabled={isUpdating}
        style={{
          backgroundColor: userVote === 'votesMindBlowing' ? '#16a34a' : '',
        }}
      >
        🤯 {fact.votesMindBlowing}
      </button>
      <button
        onClick={() => handleVote('votesFalse')}
        disabled={isUpdating}
        style={{ backgroundColor: userVote === 'votesFalse' ? '#ef4444' : '' }}
      >
        ⛔️ {fact.votesFalse}
      </button>
    </div>
  );
};

export default FactVoteButtons;
