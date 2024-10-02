import { useState } from 'react';

const API_ROOT = 'http://localhost:3020'; // Assuming your server is hosted on the same domain

export const useTypefullyDrafts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addDraft = async (content, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ROOT}/upload-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          threadify: options.threadify,
          share: options.share,
          scheduleDate: options.scheduleDate,
          autoRetweetEnabled: options.autoRetweetEnabled,
          autoPlugEnabled: options.autoPlugEnabled,
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