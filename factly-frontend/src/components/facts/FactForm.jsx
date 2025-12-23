import { useAuth } from '../../hooks/useAuth';
import { useFactForm } from '../../hooks/useFactForm';
import API from '../../utils/api';
import { transformFact } from '../../utils/transformers';
import './FactForm.css';

function FactForm({ setFacts, setShowForm, categoryColors }) {
  const { user } = useAuth(); // Get current user

  // useState declarations from useFactForm hook:
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
    resetForm,
  } = useFactForm();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate input
    if (!isValid) return;

    setIsUploading(true);
    try {
      const response = await API.post('/facts', {
        text,
        source,
        category,
      });

      const newFact = response.data.data.fact;

      // Transform to match frontend structure
      const transformedFact = transformFact(newFact, {
        username: user.username,
        avatar_url: user.avatarUrl,
      });

      setFacts((facts) => [transformedFact, ...facts]);
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error adding fact:', error);
      alert(
        error.response?.data?.message || 'Failed to add fact. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const categories = Object.keys(categoryColors);

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span>{200 - textLength}</span>

      <input
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose category:</option>
        {categories.map((category) => {
          return (
            <option value={category} key={category}>
              {category.toUpperCase()}
            </option>
          );
        })}
      </select>
      <button className="btn btn-large" disabled={isUploading || !isValid}>
        {isUploading ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}

export default FactForm;
