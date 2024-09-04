// EventDetails.js
import React from 'react';

export const EventDetails = ({ event }) => {
  return (
    <div className="mb-4">
      <p><strong>Partner:</strong> {event.partner.name}</p>
      {event.partner.twitter && (
        <p>
          <strong>Twitter:</strong> 
          <a 
            href={`https://twitter.com/${event.partner.twitter}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="ml-2 text-blue-500"
          >
            @{event.partner.twitter}
          </a>
        </p>
      )}
      <p><strong>Content Type:</strong> {event.contentType}</p>
      <p><strong>Time Slot:</strong> {event.timeSlot}</p>
      <p><strong>Date:</strong> {new Date(event.date).toDateString()}</p>
    </div>
  );
};