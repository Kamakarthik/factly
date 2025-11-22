function CategoryFilter({ factsData, categoryColors }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button className="btn btn-all-categories">All</button>
        </li>
        {factsData.map((fact) => {
          const bgcolor = categoryColors[fact.category?.trim()] || '6b7280';
          return (
            <li className="category">
              <button
                className="btn btn-category"
                style={{ backgroundColor: `#${bgcolor}` }}
              >
                {fact.category}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
export default CategoryFilter;
