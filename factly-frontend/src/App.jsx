import { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useFacts } from './hooks/useFacts';
import { useCategories } from './hooks/useCategories';
import Auth from './components/auth/Auth';
import Header from './components/layout/Header';
import Profile from './components/profile/Profile';
import UserProfile from './components/profile/UserProfile';
import CategoryFilter from './components/ui/CategoryFilter';
import FactForm from './components/facts/FactForm';
import FactList from './components/facts/FactList';
import SortBy from './components/ui/SortBy';
import './App.css';

function App() {
  const { user } = useAuth(); // Get current user
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

  return (
    <Router>
      <Header showForm={showForm} setShowForm={setShowForm} />

      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={
            <>
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
          }
        />

        {/* Own Profile Page */}
        <Route
          path="/profile"
          element={
            <Profile
              onFactDelete={handleFactDelete}
              onFactUpdate={handleFactUpdate}
            />
          }
        />

        {/* User Profile Page*/}
        <Route path="/user/:userId" element={<UserProfile />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
