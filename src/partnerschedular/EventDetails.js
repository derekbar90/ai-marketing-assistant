// EventDetails.js
import React from 'react';

export const EventDetails = ({ event }) => {
  return (
    <div className="mb-4 bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1">{event.partner.name}</h2>
          {event.partner.twitter && (
            <a
              href={`https://twitter.com/${event.partner.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              @{event.partner.twitter}
            </a>
          )}
        </div>
        <div className="flex space-x-6">
          <EventDetailItem label="Content Type" value={event.contentType} />
          <div className="border-r border-gray-300 mx-2"></div>
          <EventDetailItem label="Time Slot" value={event.timeSlot} />
          <div className="border-r border-gray-300 mx-2"></div>
          <EventDetailItem label="Date" value={new Date(event.date).toDateString()} />
        </div>
      </div>
    </div>
  );
};

const EventDetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);