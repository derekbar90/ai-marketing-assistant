import { useState, useCallback } from 'react';
import { usePGlite } from '@electric-sql/pglite-react';
import { useOpenAIEmbeddings } from './useOpenAIEmbeddings';

export const usePartnerEmbeddedFiles = (partnerId, apiKey) => {
  const db = usePGlite();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getEmbedding } = useOpenAIEmbeddings(apiKey);

  const queryEmbeddedFiles = useCallback(async (query, limit = 5) => {
    setLoading(true);
    setError(null);
    try {
      const embedding = await getEmbedding(query);
      if (!embedding) throw new Error('Failed to generate embedding for query');

      const embeddingString = `[${embedding.join(',')}]`;
      const result = await db.query(`
        SELECT id, filename, content, 
               (embedding <=> $1::vector) as distance
        FROM partner_files
        WHERE partner_id = $2
        ORDER BY distance ASC
        LIMIT $3;
      `, [embeddingString, partnerId, limit]);

      setResults(result.rows);
      return result.rows; // Return the results directly
    } catch (err) {
      console.error('Error querying embedded files:', err);
      setError(err.message);
      return []; // Return an empty array in case of error
    } finally {
      setLoading(false);
    }
  }, [db, partnerId, getEmbedding]);

  const generatePrompt = useCallback((query, results) => {
    const context = results.map(result => `File: ${result.filename}\nContent: ${result.content}`).join('\n\n');
    return `
      You are an AI assistant tasked with generating assumptions about a partner based on the provided context.
      Use the following information to generate a list of assumptions:

      ${context}

      User Query: ${query}

      Please provide a list of assumptions about the partner based on the given context.
      Return the assumptions as a JSON array of objects, where each object has an "assumption" key.
      For example: [{"assumption": "The partner is focused on blockchain technology"}, {"assumption": "The partner has a strong presence in Asia"}]
    `;
  }, []);

  return { queryEmbeddedFiles, results, loading, error, generatePrompt };
};