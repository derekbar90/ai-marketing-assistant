import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export const EventSidebar = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed top-0 right-0 w-1/3 h-full bg-white shadow-lg z-50">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <Button onClick={onClose} className="absolute top-2 right-2">Close</Button>
        </CardHeader>
        <CardContent>
          <p><strong>Partner:</strong> {event.partner.name}</p>
          <p><strong>Content Type:</strong> {event.contentType}</p>
          <p><strong>Time Slot:</strong> {event.timeSlot}</p>
          <p><strong>Date:</strong> {new Date(event.date).toDateString()}</p>
        </CardContent>
      </Card>
    </div>
  );
};