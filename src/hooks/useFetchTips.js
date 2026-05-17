import { useState, useEffect, useCallback, useRef } from 'react';

export const useFetchTips = (selectedDate) => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const lastDateRef = useRef(selectedDate);

  // Function to manually trigger a re-fetch of the data
  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    setLastRefreshTime(Date.now());
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchTodayTips = async () => {
      setLoading(true);
      setError(null);

      // If the date has changed, clear the tips immediately to show the skeleton.
      // If it's just a refresh of the same date, we keep the old tips for a "seamless" update.
      if (lastDateRef.current !== selectedDate) {
        setTips([]);
        lastDateRef.current = selectedDate;
      }

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
  }, [selectedDate, refreshKey]);

  return { tips, loading, error, refresh, lastRefreshTime };
};