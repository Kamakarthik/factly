import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCategories } from '../../hooks/useCategories';
import FactList from '../facts/FactList';
import API from '../../utils/api';
import { PacmanLoader } from 'react-spinners';
import './profile.css';

export default function UserProfile() {
  const { userId } = useParams(); // Get userId from URL
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const categoryColors = useCategories();
  const [userFacts, setUserFacts] = useState([]);
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch user's facts
        const factsResponse = await API.get(`/facts/user/${userId}`);
        const factsData = factsResponse.data.data.facts;

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

        setUserFacts(transformedFacts);

        // Get user info from first fact or fetch separately
        if (transformedFacts.length > 0 && transformedFacts[0].profiles) {
          setProfileUser({
            _id: userId,
            username: transformedFacts[0].profiles.username,
            avatarUrl: transformedFacts[0].profiles.avatar_url,
          });
        } else {
          // If no facts, fetch user info separately
          const userResponse = await API.get(`/users/${userId}`);
          const userData = userResponse.data.data.user;
          setProfileUser({
            _id: userData._id,
            username: userData.username,
            avatarUrl: userData.avatarUrl,
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="profile-container">
        <p className="loading-text">
          <PacmanLoader color="#F59E0B" />
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <p className="loading-text">{error}</p>
        <button className="btn btn-large" onClick={() => navigate('/')}>
          Go Back Home
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === userId;
  const displayName = profileUser?.username || 'User';

  return (
    <div className="profile-wrapper">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="profile-header">
          <img
            src={profileUser?.avatarUrl || '/default-avatar.svg'}
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

        <button className="sidebar-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>

        {isOwnProfile && (
          <button className="sidebar-btn" onClick={() => navigate('/profile')}>
            View My Profile
          </button>
        )}
      </aside>

      {/* Main Content */}
      <div className="profile-main">
        <div className="profile-facts">
          <h3>{isOwnProfile ? 'Your' : `${displayName}'s`} Facts</h3>

          {userFacts.length === 0 ? (
            <p className="no-facts">
              {isOwnProfile
                ? "You haven't shared any facts yet. Start sharing! 🚀"
                : `${displayName} hasn't shared any facts yet.`}
            </p>
          ) : (
            <FactList
              factsData={userFacts}
              setFacts={setUserFacts}
              categoryColors={categoryColors}
              loadMoreFacts={() => {}}
              hasMore={false}
              isLoading={false}
              showDeleteOnly={false} // Show votes, not edit/delete
              onEdit={null}
            />
          )}
        </div>
      </div>
    </div>
  );
}
