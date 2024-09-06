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
import { ApiKeyManager } from './ApiKeyManager';

export const AppContext = createContext();

import { PGlite } from "@electric-sql/pglite"
import { live } from "@electric-sql/pglite/live"
import { vector } from "@electric-sql/pglite/vector"
import { PGliteProvider } from "@electric-sql/pglite-react"
import { ToastProvider } from '../components/ui/toast';

const db = await PGlite.create({
  extensions: { live, vector },
  dataDir: 'idb://my-pgdata'
})

export const PartnerSchedulingApp = () => {
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
    <ToastProvider>
    <PGliteProvider db={db}>
    <AppContext.Provider value={{ state, dispatch }}>
      <div className="p-4 mx-14 mx-auto">
        <h1 className="text-2xl font-bold mb-4">Partner Content Scheduling App</h1>

        <div className="flex space-x-4">
          <div className="w-1/2">
            <PartnerList />
          </div>
          <div className="w-1/2 space-y-4">
            <div className="flex space-x-2">
              <Button
                onClick={handleExport}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Export to CSV
              </Button>
              <Button
                onClick={handleBulkAddClick}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Bulk Add Partners
              </Button>
              <ApiKeyManager />
            </div>
            <ScheduleGenerator onGenerate={handleGenerateSchedule} />
            <CalendarView onEventClick={handleEventClick} />
          </div>
        </div>

        <EventSidebar event={selectedEvent} onClose={handleCloseSidebar} />
        {showBulkAdd && <BulkAddPartners onClose={handleCloseBulkAdd} />}
      </div>
    </AppContext.Provider>
    </PGliteProvider>
    </ToastProvider>
  );
};