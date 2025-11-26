import { useState, useEffect, useCallback } from 'react';
import supabase from '../supabase';

export const useFacts = (currentCategory, sortBy = 'interesting') => {
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const FACTS_PER_PAGE = 5;

  // Reset when category changes
  useEffect(() => {
    setFacts([]);
    setPage(0);
    setHasMore(true);
  }, [currentCategory, sortBy]);

  // Load initial facts when category changes
  useEffect(() => {
    let isMounted = true;

    const fetchInitial = async () => {
      setIsLoading(true);

      let query = supabase.from('facts').select('*');

      if (currentCategory !== 'all') {
        query = query.eq('category', currentCategory);
      }

      switch (sortBy) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'interesting':
          query = query.order('votesInteresting', { ascending: false });
          break;
        case 'mindblowing':
          query = query.order('votesMindBlowing', { ascending: false });
          break;
        case 'false':
          query = query.order('votesFalse', { ascending: false });
          break;
        default:
          query = query.order('votesInteresting', { ascending: false });
      }

      const { data: factsData, error: factsError } = await query.range(
        0,
        FACTS_PER_PAGE - 1
      );

      if (isMounted) {
        if (!factsError && factsData) {
          setFacts(factsData);
          setHasMore(factsData.length === FACTS_PER_PAGE);
        } else {
          alert('There was a problem getting data');
        }
        setIsLoading(false);
      }
    };

    fetchInitial();

    return () => {
      isMounted = false;
    };
  }, [currentCategory, sortBy]);

  // Load more facts when user calls loadMoreFacts
  const loadMoreFacts = useCallback(async () => {
    if (isLoading || !hasMore) {
      return;
    }

    setIsLoading(true);

    let query = supabase.from('facts').select('*');

    if (currentCategory !== 'all') {
      query = query.eq('category', currentCategory);
    }

    switch (sortBy) {
      case 'recent':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'interesting':
        query = query.order('votesInteresting', { ascending: false });
        break;
      case 'mindblowing':
        query = query.order('votesMindBlowing', { ascending: false });
        break;
      case 'false':
        query = query.order('votesFalse', { ascending: false });
        break;
      default:
        query = query.order('votesInteresting', { ascending: false });
    }

    const nextPage = page + 1;
    const { data: factsData, error: factsError } = await query.range(
      nextPage * FACTS_PER_PAGE,
      (nextPage + 1) * FACTS_PER_PAGE - 1
    );

    if (!factsError && factsData) {
      // Append only new facts to avoid duplicates (prevents duplicate keys and re-mounts)
      setFacts((prev) => {
        const existingIds = new Set(prev.map((f) => f.id));
        const newUnique = factsData.filter((f) => !existingIds.has(f.id));
        return [...prev, ...newUnique];
      });
      setHasMore(factsData.length === FACTS_PER_PAGE);
      setPage(nextPage);
    } else {
      alert('There was a problem getting data');
    }

    setIsLoading(false);
  }, [page, isLoading, hasMore, currentCategory, sortBy]);

  return { facts, setFacts, isLoading, loadMoreFacts, hasMore };
};
