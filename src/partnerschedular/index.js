import React, { useReducer, createContext, useState, useEffect } from 'react';
import { usePGlite } from "@electric-sql/pglite-react";
import { PartnerList } from './PartnerList';
import { ScheduleGenerator } from './ScheduleGenerator';
import { CalendarView } from './CalendarView';
import { EventSidebar } from './EventSidebar';
import { BulkAddPartners } from './BulkAddPartners';
import { appReducer, loadStateFromLocalStorage } from './appReducer';
import { generateSchedule } from './scheduleUtils';
import { resolveConflicts } from './conflictResolution';
import { exportToCSV } from './exportUtils';
import { Button } from './../components/ui/button';
import { generateUniqueId } from '../utils/eventUtils'; // Import generateUniqueId

export const AppContext = createContext();

export const PartnerSchedulingApp = () => {
  const db = usePGlite();
  const [state, dispatch] = useReducer(appReducer, loadStateFromLocalStorage());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  const handleGenerateSchedule = () => {
    const newSchedule = generateSchedule(state).map(event => ({
      ...event,
      id: generateUniqueId(), // Ensure each event has a unique ID
    }));
    const resolvedSchedule = resolveConflicts(newSchedule);
    dispatch({ type: 'SET_SCHEDULE', payload: resolvedSchedule });
  };

  const handleExport = () => {
    exportToCSV(state.schedule);
  };

  const handleEventClick = (event) => {
    console.log('Event clicked:', event); // Log the event object
    setSelectedEvent(event);
  };

  const handleCloseSidebar = () => {
    setSelectedEvent(null);
  };

  const handleBulkAddClick = () => {
    setShowBulkAdd(true);
  };

  const handleCloseBulkAdd = () => {
    setShowBulkAdd(false);
  };

  return (
    <AppContext.Provider value={{ state, dispatch, db }}>
      <div className="p-4 mx-14 mx-auto">
        <h1 className="text-2xl font-bold mb-4">Partner Content Scheduling App</h1>

        <div className="flex">
          <div className="w-1/2 pr-2">
            <PartnerList />
          </div>
          <div className="w-1/2 pl-2">
            <Button
              onClick={handleExport}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Export to CSV
            </Button>

            <Button
              onClick={handleBulkAddClick}
              className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Bulk Add Partners
            </Button>
            <ScheduleGenerator onGenerate={handleGenerateSchedule} />
            <CalendarView onEventClick={handleEventClick} />
          </div>
        </div>

        <EventSidebar event={selectedEvent} onClose={handleCloseSidebar} />
        {showBulkAdd && <BulkAddPartners onClose={handleCloseBulkAdd} />}
      </div>
    </AppContext.Provider>
  );
};