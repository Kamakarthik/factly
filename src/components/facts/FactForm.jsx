import { useAuth } from '../../hooks/useAuth';
import { useFactForm } from '../../hooks/useFactForm';
import supabase from '../../utils/supabase';
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
      // 1. Insert and get complete fact with profile 
      const { data: newFactArray, insertError } = await supabase
        .from('facts')
        .insert([{ text, source, category, user_id: user.id }])
        .select('*,profiles(username,avatar_url)');

      if (insertError) throw insertError;

      // Get first item from array
      const newFact = newFactArray?.[0];

      if (!newFact || !newFact.id) {
        throw new Error('Failed to create fact');
      }

      // console.log('New fact added:', newFact);

      // 3. Add newFact to UI with profile data (or fallback to basic data)
      setFacts((facts) => [newFact, ...facts]);

      // 4. Reset input fields and close form
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error adding fact:', error);
      alert('Failed to add fact. Please try again.');
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
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

export default FactForm;
