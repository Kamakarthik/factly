import { useState } from 'react';
import supabase from '../supabase';
function FactForm({ setFacts, setShowForm, categoryColors }) {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const textLength = text.length;
  const isValidUrl = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate input
    if (text && isValidUrl(source) && category && textLength <= 200) {
      // 3. Create a new fact object and Upload fact to Supabase and receive the new fact object
      setIsUploading(true);
      const { data: newFact, error } = await supabase
        .from('facts')
        .insert([{ text, source, category }])
        .select();
      setIsUploading(false);

      // console.log('New fact added:', newFact);

      // 4. Add the new fact to the UI: add the fact to state
      if (!error) setFacts((facts) => [newFact[0], ...facts]);
      else alert('There was a problem adding your fact');

      // 5. Reset input fields
      setText('');
      setSource('');
      setCategory('');

      // 6. Close the form
      setShowForm(false);
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
