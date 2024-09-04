// hooks/useEventData.js
import { useState, useEffect } from 'react';


export const useEventData = (event) => {
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    if (event) {
      // Initialize isApproved based on event data
      setIsApproved(event.isApproved || false);
    }
  }, [event]);

  return { isApproved, setIsApproved };
};