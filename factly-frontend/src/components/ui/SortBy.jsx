import './SortBy.css';

export const SortBy = ({ sortBy, setSortBy }) => {
  return (
    <div className="sort-select-container">
      <label htmlFor="sort-select" className="sort-label">
        Sort:
      </label>
      <div className="select-wrapper">
        <select
          id="sort-select"
          name="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="interesting">Most Interesting 👍</option>
          <option value="mindblowing">Most Mind-blowing 🤯</option>
          <option value="false">Most Disputed ⛔️</option>
          <option value="recent">Most Recent 🕐</option>
          <option value="oldest">Oldest First 📜</option>
        </select>
        <svg className="select-icon" width="12" height="8" viewBox="0 0 12 8">
          <path
            d="M1 1L6 6L11 1"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default SortBy;
