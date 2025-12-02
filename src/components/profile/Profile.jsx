import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCategories } from '../../hooks/useCategories';
import FactList from '../facts/FactList';
import EditFactModal from '../facts/EditFactModal';
import supabase from '../../utils/supabase';
import { PacmanLoader } from 'react-spinners';
import './Profile.css';

export default function Profile({ onFactDelete, onFactUpdate }) {
  const { user } = useAuth();
  const categoryColors = useCategories();
  const [userFacts, setUserFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null); // Fetch profile data
  const [editingFact, setEditingFact] = useState(null);

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

    //  Notify parent (App.jsx) to update home page
    onFactUpdate?.(updatedFact);
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const displayName =
    profile?.username || user?.user_metadata?.username || user?.email;

  // Fetch user's facts
  useEffect(() => {
    if (!user?.id) return;

    const fetchUserFacts = async () => {
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('facts')
          .select('*,profiles(username,avatar_url)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUserFacts(data || []);
      } catch (error) {
        console.error('Error loading facts:', error);
        alert('Failed to load your facts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserFacts();
  }, [user?.id]);

  // Detect deletions and notify parent
  useEffect(() => {
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
  }, [userFacts, onFactDelete]);

  if (isLoading) {
    return (
      <div className="profile-container">
        <p className="loading-text">
          <PacmanLoader color="#F59E0B" />
        </p>
      </div>
    );
  }

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
            src={profile?.avatar_url || '/default-avatar.svg'}
            alt="Profile"
            className="profile-avatar"
          />
          <div className="profile-info">
            <h2>{displayName}</h2>
            <p className="profile-stats">
              {userFacts.length} {userFacts.length === 1 ? 'fact' : 'facts'}{' '}
              shared
            </p>
          </div>
        </div>

        <button className="sidebar-btn">user settings</button>
        <button className="sidebar-btn">admin dash board</button>
      </aside>

      {/* Main Content */}
      <div className="profile-main">
        <div className="profile-facts">
          <h3>Your Facts</h3>

          {userFacts.length === 0 ? (
            <p className="no-facts">
              You haven't shared any facts yet. Start sharing! 🚀
            </p>
          ) : (
            <FactList
              factsData={userFacts}
              setFacts={setUserFacts} // Custom setFacts
              categoryColors={categoryColors}
              loadMoreFacts={() => {}} // No pagination needed
              hasMore={false}
              isLoading={false}
              showDeleteOnly={true} // show only delete buttons
              onEdit={handleEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
