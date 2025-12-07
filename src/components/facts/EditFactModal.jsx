import { useFactForm } from '../../hooks/useFactForm';
import API from '../../utils/api';
import './EditFactModal.css';

export default function EditFactModal({
  fact,
  onClose,
  onUpdate,
  categoryColors,
}) {
  const {
    text,
    setText,
    source,
    setSource,
    category,
    setCategory,
    isUploading,
    setIsUploading,
    textLength,
    isValid,
  } = useFactForm(fact);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid) return;

    setIsUploading(true);

    try {
      const response = await API.patch(`/facts/${fact.id}`, {
        text,
        source,
        category,
      });

      const updatedFact = response.data.data.fact;

      // Transform to match frontend structure
      const transformedFact = {
        id: updatedFact._id,
        text: updatedFact.text,
        source: updatedFact.source,
        category: updatedFact.category,
        user_id: updatedFact.userId,
        votesInteresting: updatedFact.votesInteresting,
        votesMindBlowing: updatedFact.votesMindBlowing,
        votesFalse: updatedFact.votesFalse,
        created_at: updatedFact.createdAt,
        userVote: updatedFact.userVote || fact.userVote || null,
        profiles: updatedFact.user
          ? {
              username: updatedFact.user.username,
              avatar_url: updatedFact.user.avatarUrl,
            }
          : fact.profiles,
      };

      onUpdate(transformedFact);
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      alert(
        error.response?.data?.message ||
          'Failed to update fact. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const categories = Object.keys(categoryColors);

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <h3>Edit Your Fact</h3>

        <form className="modal-fact-form" onSubmit={handleSubmit}>
          <div className="form-group-full">
            <div className="char-count-wrapper">
              <textarea
                placeholder="Share a fact with the world..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isUploading}
                autoFocus
                maxLength={200}
              />
              <span className="char-count">{200 - textLength}</span>
            </div>
          </div>

          <div className="form-group-full">
            <input
              type="text"
              placeholder="Trustworthy source..."
              value={source}
              onChange={(e) => setSource(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div className="form-group-full">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isUploading}
            >
              <option value="">Choose category:</option>
              {categories.map((cat) => (
                <option value={cat} key={cat}>
                  {cat.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-large"
              disabled={isUploading || !isValid}
            >
              {isUploading ? 'Updating...' : 'Update Fact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
