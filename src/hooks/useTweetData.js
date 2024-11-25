import { useState, useEffect } from 'react';
import { usePGlite } from "@electric-sql/pglite-react";

export const useTweetData = (tweetId) => {
  const [tweet, setTweet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const db = usePGlite();

  useEffect(() => {
    const fetchTweet = async () => {
      setLoading(true);
      try {
        const result = await db.query(`
          SELECT id, date, content, username, handle, reply_count, retweet_count, like_count, view_count, image_url, is_verified
          FROM partner_tweets
          WHERE id = $1
        `, [tweetId]);

        if (result.rows.length > 0) {
          setTweet(result.rows[0]);
        } else {
          setError('Tweet not found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tweet:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTweet();
  }, [db, tweetId]);

  return { tweet, loading, error };
};