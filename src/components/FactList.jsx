import { useEffect, useRef } from 'react';
import FactVoteButtons from './FactVoteButtons';
import { PacmanLoader } from 'react-spinners';
function FactList({
  factsData,
  setFacts,
  categoryColors,
  loadMoreFacts,
  hasMore,
  isLoading,
}) {
  const listRef = useRef(null);

  useEffect(() => {
    const factsList = listRef.current;
    if (!factsList) {
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
  }, [loadMoreFacts, hasMore, isLoading]);

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
          const isDisputed =
            fact.votesInteresting + fact.votesMindBlowing < fact.votesFalse;
          const bgcolor = categoryColors[fact.category?.trim()] || '6b7280';

          return (
            <li className="fact" key={fact.id}>
              <p>
                {isDisputed ? (
                  <span className="disputed">[⛔️ DISPUTED]</span>
                ) : null}
                <span style={{ opacity: isDisputed ? 0.4 : 1 }}>
                  {fact.text}
                </span>
                <a className="source" href={fact.source} target="_blank">
                  (Source)
                </a>
              </p>
              <span className="tag" style={{ backgroundColor: `#${bgcolor}` }}>
                {fact.category.toUpperCase()}
              </span>
              <FactVoteButtons fact={fact} setFacts={setFacts} />
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
      {!hasMore && factsData.length > 0 && (
        <p className="end-message">🎉 You've seen all the facts!</p>
      )}
    </section>
  );
}
export default FactList;
