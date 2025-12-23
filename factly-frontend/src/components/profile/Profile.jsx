import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCategories } from '../../hooks/useCategories';
import FactList from '../facts/FactList';
import EditFactModal from '../facts/EditFactModal';
import UserSettings from './UserSettings';
import API from '../../utils/api';
import { transformFacts } from '../../utils/transformers';
import { PacmanLoader } from 'react-spinners';
import './Profile.css';

export default function Profile({ onFactDelete, onFactUpdate }) {
  const { user } = useAuth();
  const categoryColors = useCategories();
  const [userFacts, setUserFacts] = useState([]);
  const [votedFacts, setVotedFacts] = useState([]);
  const [activeTab, setActiveTab] = useState('my-facts');
  const [isLoading, setIsLoading] = useState(true);
  const [editingFact, setEditingFact] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Track previous facts to detect deletions & syncs with home page
  const prevFactsRef = useRef([]);

  const handleEdit = (fact) => {
    setEditingFact(fact);
  };

  const handleUpdate = (updatedFact) => {
    // Update local profile facts
    setUserFacts((facts) =>
      facts.map((f) => (f.id === updatedFact.id ? updatedFact : f))
    );

    // Update in voted-facts tab if it exists
    setVotedFacts((facts) =>
      facts.map((f) => (f.id === updatedFact.id ? updatedFact : f))
    );

    //  Notify parent (App.jsx) to update home page
    onFactUpdate?.(updatedFact);
  };

  // Fetch user's facts
  useEffect(() => {
    if (!user?.id && !user?._id) return;

    const fetchUserFacts = async () => {
      setIsLoading(true);

      try {
        const response = await API.get('/facts/my-facts');
        const factsData = response.data.data.facts;

        // Transform MongoDB data
        const transformedFacts = transformFacts(factsData, {
          username: user.username,
          avatar_url: user.avatarUrl,
        });

        setUserFacts(transformedFacts);
      } catch (error) {
        console.error('Error loading facts:', error);
        alert('Failed to load your facts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserFacts();
  }, [user]);

  // Fetch facts user has voted on
  useEffect(() => {
    if (!user?.id && !user?._id) return;

    const fetchVotedFacts = async () => {
      try {
        const response = await API.get('/facts/voted-facts');
        const factsData = response.data.data.facts;

        // Transform MongoDB data
        const transformedFacts = transformFacts(factsData);

        setVotedFacts(transformedFacts);
      } catch (error) {
        console.error('Error loading voted facts:', error);
      }
    };

    fetchVotedFacts();
  }, [user]);

  // Detect deletions and notify parent
  useEffect(() => {
    if (activeTab !== 'my-facts') return; // Only track deletions on my-facts tab

    // Skip on initial render
    if (prevFactsRef.current.length === 0 && userFacts.length > 0) {
      prevFactsRef.current = userFacts;
      return;
    }

    // Detect deletions by comparing previous and current facts
    const prevIds = new Set(prevFactsRef.current.map((f) => f.id));
    const currentIds = new Set(userFacts.map((f) => f.id));
    const deletedIds = [...prevIds].filter((id) => !currentIds.has(id));

    // Notify parent about deletions
    if (deletedIds.length > 0) {
      deletedIds.forEach((id) => onFactDelete?.(id));
    }

    // Update ref for next comparison
    prevFactsRef.current = userFacts;
  }, [userFacts, onFactDelete, activeTab]);

  // Handle vote updates from voted facts - sync to home page
  const handleVotedFactsUpdate = (updaterOrArray) => {
    setVotedFacts((currentFacts) => {
      // Handle both updater functions and direct arrays
      const newFacts =
        typeof updaterOrArray === 'function'
          ? updaterOrArray(currentFacts)
          : updaterOrArray;

      // Sync all updated facts to home page
      // Defer home page sync to avoid setState during render
      setTimeout(() => {
        newFacts.forEach((fact) => {
          onFactUpdate?.(fact);
        });
      }, 0);

      return newFacts;
    });
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <p className="loading-text">
          <PacmanLoader color="#F59E0B" />
        </p>
      </div>
    );
  }

  // Show settings
  if (showSettings) {
    return <UserSettings onClose={() => setShowSettings(false)} />;
  }

  const displayName = user?.username || user?.email;
  const avatarUrl = user?.avatarUrl || '/default-avatar.svg';
  const currentFacts = activeTab === 'my-facts' ? userFacts : votedFacts;
  const currentSetFacts =
    activeTab === 'my-facts' ? setUserFacts : handleVotedFactsUpdate;

  return (
    <div className="profile-wrapper">
      {/*Edit Mdal */}
      {editingFact && (
        <EditFactModal
          fact={editingFact}
          onClose={() => setEditingFact(null)}
          onUpdate={handleUpdate}
          categoryColors={categoryColors}
        />
      )}

      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="profile-header">
          <img
            src={avatarUrl}
            alt="Profile"
            className="profile-avatar"
            onError={(e) => {
              e.target.src = '/default-avatar.svg';
            }}
          />
          <div className="profile-info">
            <h2>{displayName}</h2>
            <p className="profile-stats">
              {userFacts.length} {userFacts.length === 1 ? 'fact' : 'facts'}{' '}
              shared
            </p>
            <p className="profile-stats">
              {votedFacts.length}{' '}
              {votedFacts.length === 1 ? 'reaction' : 'reactions'}
            </p>
          </div>
        </div>

        {/* Tab Buttons (NEW) */}
        <button className="sidebar-btn" onClick={() => setShowSettings(true)}>
          user settings
        </button>
        <button
          className={`sidebar-btn ${
            activeTab === 'my-facts' ? 'sidebar-btn-active' : ''
          }`}
          onClick={() => setActiveTab('my-facts')}
        >
          my facts
        </button>
        <button
          className={`sidebar-btn ${
            activeTab === 'voted-facts' ? 'sidebar-btn-active' : ''
          }`}
          onClick={() => setActiveTab('voted-facts')}
        >
          reacted facts
        </button>
        <button className="sidebar-btn">admin dashboard</button>
      </aside>

      {/* Main Content */}
      <div className="profile-main">
        <div className="profile-facts">
          <h3>
            {activeTab === 'my-facts' ? 'Your Facts' : 'Facts You Reacted To'}
          </h3>

          {currentFacts.length === 0 ? (
            <p className="no-facts">
              {activeTab === 'my-facts'
                ? "You haven't shared any facts yet. Start sharing! 🚀"
                : "You haven't reacted to any facts yet. Start exploring! 👍"}
            </p>
          ) : (
            <FactList
              factsData={currentFacts}
              setFacts={currentSetFacts}
              categoryColors={categoryColors}
              loadMoreFacts={() => {}}
              hasMore={false}
              isLoading={false}
              showDeleteOnly={activeTab === 'my-facts'} // Only show edit/delete on my-facts
              onEdit={activeTab === 'my-facts' ? handleEdit : null}
            />
          )}
        </div>
      </div>
    </div>
  );
}
