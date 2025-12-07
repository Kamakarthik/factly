import './CategoryFilter.css';

function CategoryFilter({ setCurrentCategory, categoryColors }) {
  const categories = Object.keys(categoryColors);
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory('all')}
          >
            All
          </button>
        </li>
        {categories.map((category) => {
          return (
            <li className="category" key={category}>
              <button
                className="btn btn-category"
                style={{ backgroundColor: `#${categoryColors[category]}` }}
                onClick={() => setCurrentCategory(category)}
              >
                {category.toUpperCase()}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
export default CategoryFilter;
