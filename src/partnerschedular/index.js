import React, { useReducer, createContext } from 'react';
import { PartnerList } from './PartnerList';
import { ScheduleGenerator } from './ScheduleGenerator';
import { CalendarView } from './CalendarView';
import { appReducer, initialState } from './appReducer';
import { generateSchedule } from './scheduleUtils';
import { resolveConflicts } from './conflictResolution';
import { exportToCSV } from './exportUtils';
import { Button } from './../components/ui/button';

export const AppContext = createContext();

export const PartnerSchedulingApp = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const handleGenerateSchedule = () => {
    const newSchedule = generateSchedule(state);
    const resolvedSchedule = resolveConflicts(newSchedule);
    dispatch({ type: 'SET_SCHEDULE', payload: resolvedSchedule });
  };

  const handleExport = () => {
    exportToCSV(state.schedule);
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Partner Content Scheduling App</h1>
        
        <PartnerList />
        <ScheduleGenerator onGenerate={handleGenerateSchedule} />
        <CalendarView />
        
        <Button 
          onClick={handleExport}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Export to CSV
        </Button>
      </div>
    </AppContext.Provider>
  );
};