import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import API from '../utils/api';

export const useFacts = (currentCategory, sortBy = 'interesting') => {
  const { user } = useAuth();
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const FACTS_PER_PAGE = 10;

  // Map frontend sortBy to backend sort query
  const getSortQuery = (sortBy) => {
    const sortMap = {
      recent: '-createdAt',
      oldest: 'createdAt',
      interesting: '-votesInteresting',
      mindblowing: '-votesMindBlowing',
      false: '-votesFalse',
    };
    return sortMap[sortBy] || '-votesInteresting';
  };

  // Reset when category or sort changes
  useEffect(() => {
    setFacts([]);
    setPage(1);
    setHasMore(true);
  }, [currentCategory, sortBy]);

  // Load initial facts
  useEffect(() => {
    // DON'T fetch if user is not ready yet
    if (!user) {
      console.log('Waiting for user authentication...');
      return;
    }

    let isMounted = true;

    const fetchInitial = async () => {
      setIsLoading(true);

      try {
        const params = {
          page: 1,
          limit: FACTS_PER_PAGE,
          sort: getSortQuery(sortBy),
        };

        if (currentCategory !== 'all') {
          params.category = currentCategory;
        }

        const response = await API.get('/facts', { params });
        const factsData = response.data.data.facts;

        if (!isMounted) return;

        // Transform MongoDB data
        const transformedFacts = factsData.map((fact) => ({
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
            : null,
        }));

        setFacts(transformedFacts);
        setHasMore(factsData.length === FACTS_PER_PAGE);
      } catch (error) {
        console.error('Error fetching facts:', error);
        alert('Failed to load facts. Please try again.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchInitial();

    return () => {
      isMounted = false;
    };
  }, [currentCategory, sortBy, user]);

  // Load more facts
  const loadMoreFacts = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const nextPage = page + 1;
      const params = {
        page: nextPage,
        limit: FACTS_PER_PAGE,
        sort: getSortQuery(sortBy),
      };

      if (currentCategory !== 'all') {
        params.category = currentCategory;
      }

      const response = await API.get('/facts', { params });
      const factsData = response.data.data.facts;

      const transformedFacts = factsData.map((fact) => ({
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
          : null,
      }));

      setFacts((prev) => {
        const existingIds = new Set(prev.map((f) => f.id));
        const newUnique = transformedFacts.filter(
          (f) => !existingIds.has(f.id)
        );
        return [...prev, ...newUnique];
      });

      setHasMore(factsData.length === FACTS_PER_PAGE);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more facts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, currentCategory, sortBy]);

  return { facts, setFacts, isLoading, loadMoreFacts, hasMore };
};
