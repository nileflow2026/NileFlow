import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer that will update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to clear the timer if value changes before the delay
    // This prevents the debounce from firing multiple times
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Rerun the effect if value or delay changes

  return debouncedValue;
}

export default useDebounce;