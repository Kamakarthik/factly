import { useState } from 'react';

export const useFactForm = (initialData = null) => {
  const [text, setText] = useState(initialData?.text || '');
  const [source, setSource] = useState(initialData?.source || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [isUploading, setIsUploading] = useState(false);

  const textLength = text.length;

  const isValidUrl = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isValid = text && isValidUrl(source) && category && textLength <= 200;

  const resetForm = () => {
    setText('');
    setSource('');
    setCategory('');
  };

  return {
    text,
    setText,
    source,
    setSource,
    category,
    setCategory,
    isUploading,
    setIsUploading,
    textLength,
    isValid,
    resetForm,
  };
};
