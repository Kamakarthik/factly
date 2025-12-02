import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useFacts } from './hooks/useFacts';
import { useCategories } from './hooks/useCategories';
import Auth from './components/auth/Auth';
import Header from './components/layout/Header';
import Profile from './components/profile/Profile';
import CategoryFilter from './components/ui/CategoryFilter';
import FactForm from './components/facts/FactForm';
import FactList from './components/facts/FactList';
import  SortBy  from './components/ui/SortBy';
import './App.css';

function App() {
  const { user } = useAuth(); // Get current user
  const [currentPage, setCurrentPage] = useState('home');
  const [currentCategory, setCurrentCategory] = useState('all');
  const [sortBy, setSortBy] = useState('interesting');
  const { facts, setFacts, isLoading, loadMoreFacts, hasMore } = useFacts(
    currentCategory,
    sortBy
  );
  const categoryColors = useCategories();
  const [showForm, setShowForm] = useState(false);

  // Shared delete handler - removes fact from home page state
  const handleFactDelete = (factId) => {
    setFacts((currentFacts) => currentFacts.filter((f) => f.id !== factId));
  };

  // Shared update handler - updates fact on home page state
  const handleFactUpdate = (updatedFact) => {
    setFacts((currentFacts) =>
      currentFacts.map((f) => (f.id === updatedFact.id ? updatedFact : f))
    );
  };

  // Show login page if not authenticated
  if (!user) {
    return <Auth />;
  }

  // Show profile page
  if (currentPage === 'profile') {
    return (
      <>
        <Header
          showForm={showForm}
          setShowForm={setShowForm}
          onNavigate={setCurrentPage}
          currentPage={currentPage}
        />
        <Profile
          onFactDelete={handleFactDelete}
          onFactUpdate={handleFactUpdate}
        />
      </>
    );
  }

  // Render home page
  return (
    <>
      <Header
        showForm={showForm}
        setShowForm={setShowForm}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
      />
      {showForm && (
        <FactForm
          setFacts={setFacts}
          setShowForm={setShowForm}
          categoryColors={categoryColors}
        />
      )}
      <main className="main">
        <CategoryFilter
          setCurrentCategory={setCurrentCategory}
          categoryColors={categoryColors}
        />

        <div className="main-content">
          <SortBy sortBy={sortBy} setSortBy={setSortBy} />
          <FactList
            factsData={facts}
            setFacts={setFacts}
            categoryColors={categoryColors}
            loadMoreFacts={loadMoreFacts}
            hasMore={hasMore}
            isLoading={isLoading}
          />
        </div>
      </main>
    </>
  );
}

export default App;
