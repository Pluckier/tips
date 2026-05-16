import { useState, useEffect } from 'react';

export const useFetchTips = (selectedDate) => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchTodayTips = async () => {
      setLoading(true);
      setError(null);
      setTips([]);
      console.log(`[useFetchTips Hook] Initiating fetch for: ${selectedDate}`);
      try {
        // Parse YYYY-MM-DD to DD-MM-YYYY for the API
        const [year, month, day] = selectedDate.split('-');
        const dateStr = `${day}-${month}-${year}`;

        const url = `https://www.pluckier.co.uk/${dateStr}-races.json`;
        console.log(`[useFetchTips Hook] Requesting: ${url}`);
        
        const response = await fetch(url, { signal: abortController.signal });
        if (!response.ok) {
          throw new Error(`Could not fetch tips for ${dateStr}`);
        }

        const data = await response.json();
        setTips(data);
        console.log(`[useFetchTips Hook] Data received: ${data.length} entries.`);
      } catch (err) {
        if (err.name === 'AbortError') return; // Ignore expected cancellation errors
        setError(err.message);
        console.error(`[useFetchTips Hook] Error: ${err.message}`);
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchTodayTips();

    return () => abortController.abort(); // Cancel the request if the date changes or component unmounts
  }, [selectedDate]);

  return { tips, loading, error };
};