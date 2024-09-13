import { useState } from 'react';

const API_ROOT = 'https://api.typefully.com/v1';

export const useTypefullyDrafts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addDraft = async (content, options = {}) => {
    setIsLoading(true);
    setError(null);

    const typefullyApiKey = localStorage.getItem('typefullyApiKey');

    if (!typefullyApiKey) {
      setError('Typefully API key not found. Please set it in the Settings.');
      setIsLoading(false);
      return null;
    }

    try {
      const response = await fetch(`${API_ROOT}/drafts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': typefullyApiKey, // Removed 'Bearer '
        },
        body: JSON.stringify({
          content,
          threadify: options.threadify || false,
          share: options.share || false,
          'schedule-date': options.scheduleDate || 'next-free-slot',
          auto_retweet_enabled: options.autoRetweetEnabled || false,
          auto_plug_enabled: options.autoPlugEnabled || false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  };

  return { addDraft, isLoading, error };
};