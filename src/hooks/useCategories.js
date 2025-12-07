import { useState, useEffect } from 'react';
import API from '../utils/api';

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
        const response = await API.get('/categories');
        const categoriesData = response.data.data.categories;

        if (categoriesData && categoriesData.length > 0) {
          const colorMap = {};
          categoriesData.forEach((cat) => {
            colorMap[cat.category.trim()] = cat.colour.trim();
          });
          setCategoryColors(colorMap);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return categoryColors;
};
