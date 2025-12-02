import { useState, useEffect } from 'react';
import supabase from '../utils/supabase';

// Default fallback categories
const DEFAULT_CATEGORIES = {
  technology: '3b82f6',
  science: '16a34a',
  finance: 'ef4444',
  society: 'eab308',
  entertainment: '8b5cf6',
  health: 'ec4899',
  history: '14b8a6',
  news: '6b7280',
};

export const useCategories = () => {
  const [categoryColors, setCategoryColors] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: categoriesData, error } = await supabase
          .from('categories')
          .select('category, colour');

        if (error) throw error;

        if (categoriesData && categoriesData.length > 0) {
          // Create a mapping object:{"technology":"3b82f6"..}
          const colorMap = {};
          categoriesData.forEach((cat) => {
            const cleanCategory = cat.category.trim();
            const cleanColor = cat.colour.trim();
            colorMap[cleanCategory] = cleanColor;
          });
          setCategoryColors(colorMap);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Keep default categories on error
      }
    };

    fetchCategories();
  }, []);

  return categoryColors;
};
