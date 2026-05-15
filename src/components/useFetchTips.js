import { useState, useEffect } from 'react';

export const useFetchTips = (selectedDate) => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTodayTips = async () => {
      setLoading(true);
      setError(null);
      setTips([]); // Clear old tips so the skeleton/loading state is visible
      console.log(`[useFetchTips] Initiating fetch for date: ${selectedDate}`);
      try {
        // Parse YYYY-MM-DD to DD-MM-YYYY for the API
        const [year, month, day] = selectedDate.split('-');
        const dateStr = `${day}-${month}-${year}`;

        const url = `https://www.pluckier.co.uk/${dateStr}-races.json`;
        
        console.log(`[useFetchTips] Fetching URL: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Could not fetch tips for ${dateStr}`);
        }

        const data = await response.json();
        setTips(data);
        console.log(`[useFetchTips] Successfully loaded ${data.length} races.`);
      } catch (err) {
        setError(err.message);
        console.error(`[useFetchTips] Fetch error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayTips();
  }, [selectedDate]);

  return { tips, loading, error };
};