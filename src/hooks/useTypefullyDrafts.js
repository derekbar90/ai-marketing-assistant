import { useState } from 'react';

const API_ROOT = 'http://localhost:3020'; // Assuming your server is hosted on the same domain

// Function to adjust the schedule time to the closest window
const adjustScheduleTime = (date) => {
  const targetHours = [12, 14, 17]; // 12 PM, 2 PM, 5 PM in 24-hour format
  const scheduleDate = new Date(date);
  const currentHour = scheduleDate.getHours();
  
  let closestHour = targetHours[0];
  let minDifference = Math.abs(currentHour - targetHours[0]);

  for (let i = 1; i < targetHours.length; i++) {
    const diff = Math.abs(currentHour - targetHours[i]);
    if (diff < minDifference) {
      minDifference = diff;
      closestHour = targetHours[i];
    }
  }

  scheduleDate.setHours(closestHour, 0, 0, 0);
  return scheduleDate;
};

export const useTypefullyDrafts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addDraft = async (content, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const adjustedScheduleDate = options.scheduleDate 
        ? adjustScheduleTime(options.scheduleDate)
        : adjustScheduleTime(new Date());

      const response = await fetch(`${API_ROOT}/upload-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          threadify: options.threadify,
          share: options.share,
          scheduleDate: adjustedScheduleDate.toISOString(),
          autoRetweetEnabled: options.autoRetweetEnabled,
          autoPlugEnabled: options.autoPlugEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  };

  return { addDraft, isLoading, error };
};