import { useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import FactVoteButtons from './FactVoteButtons';
import supabase from '../../utils/supabase';
import { PacmanLoader } from 'react-spinners';
import './FactList.css';

function FactList({
  factsData,
  setFacts,
  categoryColors,
  loadMoreFacts,
  hasMore,
  isLoading,
  showDeleteOnly = false,
  onEdit,
}) {
  const { user } = useAuth();
  const listRef = useRef(null);

  useEffect(() => {
    const factsList = listRef.current;

    if (!factsList || showDeleteOnly) {
      return;
    }

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = factsList;

      // When user scrolls to bottom (with 100px threshold)
      if (
        scrollTop + clientHeight >= scrollHeight - 100 &&
        hasMore &&
        !isLoading
      ) {
        loadMoreFacts();
      }
    };

    factsList.addEventListener('scroll', handleScroll);

    return () => {
      factsList.removeEventListener('scroll', handleScroll);
    };
  }, [loadMoreFacts, hasMore, isLoading, showDeleteOnly]);

  const handleDelete = async (factId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this fact?'
    );

    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('facts')
        .delete()
        .eq('id', factId)
        .select(); // Add select to see what would be deleted

      // console.log('Delete response:', { data, error });

      if (error) throw error;

      // Update UI optimistically
      setFacts((facts) => facts.filter((f) => f.id !== factId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete fact. Please try again.');
    }
  };

  if (factsData.length === 0 && !isLoading) {
    return (
      <p className="loading-text">
        No facts available for this category yet. Be the first to add one! ✌️
      </p>
    );
  }

  return (
    <section>
      <ul ref={listRef} className="facts-list">
        {factsData.map((fact) => {
          const positiveVotes = fact.votesInteresting + fact.votesMindBlowing;
          const falseVotes = fact.votesFalse;
          const isDisputed =
            falseVotes > 0 && falseVotes >= positiveVotes * 0.5;
          const bgcolor = categoryColors[fact.category?.trim()] || '6b7280';
          const isOwner = user?.id === fact.user_id;
          const isAdmin = user?.app_metadata?.role === 'admin';

          return (
            <li className="fact" key={fact.id}>
              {/* User info section */}
              <div className="fact-user">
                <img
                  src={fact.profiles?.avatar_url || '/default-avatar.svg'}
                  alt={fact.profiles?.username || 'User'}
                  className="fact-avatar"
                  onError={(e) => {
                    e.target.src = '/default-avatar.svg';
                  }}
                />
                <span className="fact-username">
                  {fact.profiles?.username || 'Anonymous'}
                </span>
              </div>

              <div className="fact-content-wrapper">
                <p>
                  {isDisputed ? (
                    <span className="disputed">[⛔️ DISPUTED]</span>
                  ) : null}
                  <span style={{ opacity: isDisputed ? 0.4 : 1 }}>
                    {fact.text}
                  </span>
                  <a
                    className="source"
                    href={fact.source}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    (Source)
                  </a>
                </p>
                <span
                  className="tag"
                  style={{ backgroundColor: `#${bgcolor}` }}
                >
                  {fact.category?.toUpperCase() || 'UNKNOWN'}
                </span>

                <FactVoteButtons
                  fact={fact}
                  setFacts={setFacts}
                  showDeleteOnly={showDeleteOnly}
                />

                {/* Edit & Delete buttons for owner */}
                {((showDeleteOnly && isOwner) || isAdmin) && (
                  <div className="owner-actions">
                    {isOwner && onEdit && (
                      <button
                        className="btn-edit"
                        onClick={() => onEdit(fact)}
                        title="Edit fact"
                      >
                        ✏️
                      </button>
                    )}
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(fact.id)}
                      title="Delete fact"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {isLoading && (
        <p className="loading-text">
          {' '}
          <PacmanLoader color="#F59E0B" />
        </p>
      )}
      {!hasMore && factsData.length > 0 && !showDeleteOnly && (
        <p className="end-message">🎉 You've seen all the facts!</p>
      )}
    </section>
  );
}
export default FactList;
