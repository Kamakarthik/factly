function FactForm({ categoryColors }) {
  const categories = Object.keys(categoryColors);
  return (
    <form className="fact-form">
      <input type="text" placeholder="Share a fact with the world..." />
      <span>200</span>
      <input type="text" placeholder="Trustworthy source..." />
      <select>
        <option value="">Choose category:</option>
        {categories.map((category) => {
          return (
            <option value={category} key={category}>
              {category.toUpperCase()}
            </option>
          );
        })}
      </select>
      <button className="btn btn-large">Post</button>
    </form>
  );
}

export default FactForm;
