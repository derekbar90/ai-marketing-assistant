import React, { useContext } from 'react';
import { AppContext } from './index';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getEventEmoji } from '../utils/eventUtils';

export const CalendarView = () => {
  const { state, dispatch } = useContext(AppContext);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const currentDate = state.currentMonth;
  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    dispatch({ type: 'SET_CURRENT_MONTH', payload: newDate });
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    dispatch({ type: 'SET_CURRENT_MONTH', payload: newDate });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <Button onClick={handlePrevMonth}><ChevronLeft /></Button>
          <CardTitle>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</CardTitle>
          <Button onClick={handleNextMonth}><ChevronRight /></Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => (
            <div key={day} className="text-center font-bold">{day}</div>
          ))}
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="p-2 border bg-gray-100"></div>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const events = state.schedule.filter(e => new Date(e.date).toDateString() === date.toDateString());
            return (
              <div key={`day-${day}`} className="p-2 border">
                <div className="text-right">{day}</div>
                {events.map(event => (
                  <div key={event.timeSlot} className="text-xs mt-1 p-1 rounded flex items-center border">
                    <span className="w-3 h-2 rounded mr-2" style={{backgroundColor: event.partner.color}}></span>
                    {getEventEmoji(event.contentType)} {event.partner.name} - {event.contentType} ({event.timeSlot})
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};