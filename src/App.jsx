import { useState } from 'react';
import { useFacts } from './hooks/useFacts';
import { useCategories } from './hooks/useCategories';
import CategoryFilter from './components/CategoryFilter';
import FactForm from './components/FactForm';
import FactList from './components/FactList';
import Header from './components/Header';
import { PacmanLoader } from 'react-spinners';
import './index.css';

function App() {
  const [currentCategory, setCurrentCategory] = useState('all');
  const { facts, setFacts, isLoading, loadMoreFacts, hasMore } =
    useFacts(currentCategory);
  const categoryColors = useCategories();
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />
      {showForm ? (
        <FactForm
          setFacts={setFacts}
          setShowForm={setShowForm}
          categoryColors={categoryColors}
        />
      ) : null}
      <main className="main">
        <CategoryFilter
          setCurrentCategory={setCurrentCategory}
          categoryColors={categoryColors}
        />
        <FactList
          factsData={facts}
          setFacts={setFacts}
          categoryColors={categoryColors}
          loadMoreFacts={loadMoreFacts}
          hasMore={hasMore}
          isLoading={isLoading}
        />
      </main>
    </>
  );
}

export default App;
