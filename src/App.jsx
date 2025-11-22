import supabase from './supabase';
import { useState, useEffect } from 'react';
import CategoryFilter from './components/CategoryFilter';
import FactForm from './components/FactForm';
import FactList from './components/FactList';
import './index.css';

function App() {
  const [facts, setFacts] = useState([]);
  const [categoryColors, setCategoryColors] = useState({});

  useEffect(() => {
    const loadData = async () => {
      // Fetch facts
      const { data: factsData, error: factsError } = await supabase
        .from('facts')
        .select('*');
      if (!factsError) setFacts(factsData);

      // Fetch categories with colors
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('category, colour');

      if (!categoriesError) {
        // Create a mapping object:{"technology":"3b82f6"..}
        const colorMap = {};
        categoriesData.forEach((cat) => {
          // Trim whitespace from category and color values
          const cleanCategory = cat.category.trim();
          const cleanColor = cat.colour.trim();
          colorMap[cleanCategory] = cleanColor;
        });
        setCategoryColors(colorMap);
      }
    };

    loadData();
  }, []);

  return (
    <>
      <header className="header">
        <div className="logo">
          <img
            src="logo.png"
            height="68"
            width="68"
            alt="Today I Learned Logo"
          />
          <h1>Factly</h1>
        </div>

        <button className="btn btn-large btn-open">Share a fact</button>
      </header>
      <FactForm />
      <main className="main">
        <CategoryFilter />
        <FactList factsData={facts} categoryColors={categoryColors} />
      </main>
    </>
  );
}

export default App;
