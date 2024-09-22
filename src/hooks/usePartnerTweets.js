import { useState, useEffect } from 'react';
import { usePGlite } from "@electric-sql/pglite-react";

export const usePartnerTweets = (partnerId, count = 10) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const db = usePGlite();

  useEffect(() => {
    const getTweets = async () => {
      if (!partnerId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await db.query(`
          SELECT id, date, content
          FROM partner_tweets
          WHERE partner_id = $1
          ORDER BY date DESC
          LIMIT $2
        `, [partnerId, count]);

        const fetchedTweets = result.rows.map(row => ({
          id: row.id,
          created_at: row.date,
          text: row.content
        }));

        setTweets(fetchedTweets);
        setError(null);
      } catch (err) {
        console.error('Error fetching tweets:', err);
        setError('Failed to fetch tweets. Please try again later.');
        setTweets([]);
      } finally {
        setLoading(false);
      }
    };

    getTweets();
  }, [partnerId, count, db]);

  return { tweets, loading, error };
};