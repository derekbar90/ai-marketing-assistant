// hooks/useEventData.js
import { useState, useEffect } from 'react';


export const useEventData = (event) => {
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    if (event) {
      setIsApproved(event.isApproved || false);
      console.log('Event prop changed:', event);
    }
  }, [event]);

  return { isApproved, setIsApproved };
};