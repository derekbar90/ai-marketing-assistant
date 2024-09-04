import { useState, useCallback } from 'react';

export const useOpenAI = (apiKey) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCompletion = useCallback(async (prompt) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get completion from OpenAI');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      console.error('Error getting completion:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  return { getCompletion, loading, error };
};