import { useState, useEffect } from 'react';
import OpenAI from 'openai';

export const useOpenAIEmbeddings = (apiKey) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openai, setOpenai] = useState(null);

  useEffect(() => {
    if (apiKey) {
      setOpenai(new OpenAI({ apiKey: localStorage.getItem('chatgptApiKey'), dangerouslyAllowBrowser: true }));
    }
  }, [apiKey]);

  const getEmbedding = async (text) => {
    if (!openai) {
      setError('OpenAI API key is not set');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
      });
      setLoading(false);
      return response.data[0].embedding;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return { getEmbedding, loading, error };
};