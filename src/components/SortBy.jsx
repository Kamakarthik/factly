export const SortBy = ({ sortBy, setSortBy }) => {
  const options = [
    { value: 'interesting', label: 'Most Interesting 👍' },
    { value: 'mindblowing', label: 'Most Mind-blowing 🤯' },
    { value: 'false', label: 'Most Disputed ⛔️' },
    { value: 'recent', label: 'Most Recent 🕐' },
    { value: 'oldest', label: 'Oldest First 📜' },
  ];

  return (
    <div className="sort-container" role="toolbar" aria-label="Sort facts">
      <span className="sort-label">Sort by:</span>

      <div className="sort-buttons" role="group" aria-label="Sort options">
        {options.map((opt) => {
          const active = sortBy === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              className={`sort-btn ${active ? 'active' : ''}`}
              aria-pressed={active}
              onClick={() => setSortBy(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
