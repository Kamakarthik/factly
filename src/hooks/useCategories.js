import { useState, useEffect } from 'react';
import supabase from '../supabase';

export const useCategories = () => {
  const [categoryColors, setCategoryColors] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
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
      } else {
        alert('There was a problem getting categories');
      }
    };
    fetchCategories();
  }, []);

  return categoryColors;
};
