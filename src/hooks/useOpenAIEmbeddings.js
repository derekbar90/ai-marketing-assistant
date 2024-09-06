import { useState, useEffect } from 'react';
import { createOpenAIInstance } from '../partnerschedular/index';

export const useOpenAIEmbeddings = (apiKey) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openai, setOpenai] = useState(createOpenAIInstance());

  useEffect(() => {
    if (apiKey) {
      setOpenai(createOpenAIInstance());
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