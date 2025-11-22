import FactVoteButtons from './FactVoteButtons';
function FactList({ factsData, categoryColors }) {
  return (
    <section>
      <ul className="facts-list">
        {factsData.map((fact) => {
          const bgcolor = categoryColors[fact.category?.trim()] || '6b7280';

          return (
            <li className="fact" key={fact.id}>
              <p>
                {fact.text}
                <a className="source" href={fact.source} target="_blank">
                  (Source)
                </a>
              </p>
              <span className="tag" style={{ backgroundColor: `#${bgcolor}` }}>
                {fact.category}
              </span>
              <FactVoteButtons />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
export default FactList;
