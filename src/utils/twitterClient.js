const BEARER_TOKEN = 'YOUR_TWITTER_BEARER_TOKEN';

export const fetchLiveData = async (partnerName) => {
  const url = `https://api.twitter.com/2/tweets/search/recent?query=from:${partnerName}&max_results=5`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching live data:', error);
    return [];
  }
};