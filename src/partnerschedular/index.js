import React, { useReducer, createContext, useState } from 'react';
import OpenAI from 'openai';
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

export const AppContext = createContext();

export const PartnerSchedulingApp = () => {
  const [state, dispatch] = useReducer(appReducer, loadStateFromLocalStorage());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  const handleGenerateSchedule = () => {
    const newSchedule = generateSchedule(state);
    const resolvedSchedule = resolveConflicts(newSchedule);
    dispatch({ type: 'SET_SCHEDULE', payload: resolvedSchedule });
  };

  const handleExport = () => {
    exportToCSV(state.schedule);
  };

  const handleEventClick = (event) => {
    const savedContent = localStorage.getItem(`event_${event.id}_content`);
    if (savedContent) {
      event.generatedContent = savedContent;
    }
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

  const handleGenerateContent = async (template, apiKey, event) => {
    if (!template || !apiKey) {
      console.error('Template and API key are required');
      return false;
    }

    const client = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Enable this option to allow running in a browser environment
    });

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: `${template}\n\nEvent Details:\nPartner: ${event.partner.name}\nContent Type: ${event.contentType}\nTime Slot: ${event.timeSlot}\nDate: ${new Date(event.date).toDateString()}` }],
      });

      console.log('Generated content:', response.choices[0].message.content);
      return true;
    } catch (error) {
      console.error('Error generating content:', error);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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

        <EventSidebar event={selectedEvent} onClose={handleCloseSidebar} onGenerateContent={handleGenerateContent} />
        {showBulkAdd && <BulkAddPartners onClose={handleCloseBulkAdd} />}
      </div>
    </AppContext.Provider>
  );
};