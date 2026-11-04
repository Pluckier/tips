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

      try {
        // Parse YYYY-MM-DD to DD-MM-YYYY for the API
        const [year, month, day] = selectedDate.split('-');
        const dateStr = `${day}-${month}-${year}`;

        let data = null;

        // STRATEGY A: Attempt to fetch and decompress the .json.gz file
        try {
          const response = await fetch(
            `https://www.pluckier.co.uk/${dateStr}-races.json.gz`,
            { cache: 'no-store', signal: abortController.signal }
          );

          if (!response.ok) throw new Error(`Gzipped file missing on server`);

          // Decompress the binary body stream natively
          const decompressionStream = new DecompressionStream('gzip');
          const decompressedStream = response.body.pipeThrough(decompressionStream);

          data = await new Response(decompressedStream).json();
        } catch (gzipErr) {
          // If the error was a deliberate user abort, break execution immediately
          if (gzipErr.name === 'AbortError') return;

          console.warn('Gzip fetch or parsing failed, trying uncompressed fallback...', gzipErr);

          // STRATEGY B: Fallback to the uncompressed .json file
          const fallbackResponse = await fetch(
            `https://www.pluckier.co.uk/${dateStr}-races.json`,
            { cache: 'no-store', signal: abortController.signal }
          );

          if (!fallbackResponse.ok) {
            throw new Error(`Could not fetch tips for ${dateStr} in any format`);
          }

          data = await fallbackResponse.json();
        }

        // Apply data if either strategy succeeded
        setTips(data);
        setLastRefreshTime(Date.now());
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
