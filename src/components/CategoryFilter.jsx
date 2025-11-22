function CategoryFilter({ categoryColors }) {
  const categories = Object.keys(categoryColors);
  return (
    <aside>
      <ul>
        <li className="category">
          <button className="btn btn-all-categories">All</button>
        </li>
        {categories.map((category) => {
          return (
            <li className="category" key={category}>
              <button
                className="btn btn-category"
                style={{ backgroundColor: `#${categoryColors[category]}` }}
              >
                {category}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
export default CategoryFilter;
