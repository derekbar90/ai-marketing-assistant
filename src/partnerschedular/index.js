import React, { useReducer, createContext, useState, useEffect } from 'react';
import { usePGlite } from "@electric-sql/pglite-react";
import { PartnerList } from './PartnerList';
import { ScheduleGenerator } from './ScheduleGenerator';
import { CalendarView } from './CalendarView';
import { EventSidebar } from './EventSidebar';
import { PartnerSidebar } from './PartnerSidebar';
import { TemplateManager } from './TemplateManager';
import { BulkAddPartners } from './BulkAddPartners';
import { appReducer, loadStateFromLocalStorage } from './appReducer';
import { generateSchedule } from './scheduleUtils';
import { resolveConflicts } from './conflictResolution';
import { exportToCSV } from './exportUtils';
import { Button } from './../components/ui/button';
import { generateUniqueId } from '../utils/eventUtils';
import { ApiKeyManager } from './ApiKeyManager';

import { PGlite } from "@electric-sql/pglite"
import { live } from "@electric-sql/pglite/live"
import { vector } from "@electric-sql/pglite/vector"
import { PGliteProvider } from "@electric-sql/pglite-react"
import { ToastProvider } from '../components/ui/toast';

const db = await PGlite.create({
  extensions: { live, vector },
  dataDir: 'idb://my-pgdata'
})

export const AppContext = createContext();

const runAppMigrations = async () => {
  try {
    console.log('Running app migrations...');

    // Create vector extension
    await db.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

    // Create documents table
    await db.query(`
      CREATE TABLE IF NOT EXISTS partner_documents (
        id SERIAL PRIMARY KEY,
        partner_id TEXT,
        filename TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS partner_chunks (
        id SERIAL PRIMARY KEY,
        document_id INTEGER REFERENCES partner_documents(id) ON DELETE CASCADE,
        content TEXT,
        embedding vector(1536),
        chunk_index INTEGER
      );
    `);

    // Create index
    await db.query(`
      CREATE INDEX IF NOT EXISTS partner_chunks_embedding_idx 
      ON partner_chunks USING hnsw (embedding vector_ip_ops);
    `);

    console.log('App migrations completed successfully');
  } catch (error) {
    console.error('Error in runAppMigrations:', error);
  }
};

export const PartnerSchedulingApp = () => {
  const [state, dispatch] = useReducer(appReducer, loadStateFromLocalStorage());
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  const handleGenerateSchedule = () => {
    const newSchedule = generateSchedule(state).map(event => ({
      ...event,
      id: generateUniqueId(),
    }));
    const resolvedSchedule = resolveConflicts(newSchedule);
    dispatch({ type: 'SET_SCHEDULE', payload: resolvedSchedule });
  };

  useEffect(() => {
    runAppMigrations();
  }, []);

  const handleExport = () => {
    exportToCSV(state.schedule);
  };

  const handleEventClick = (event) => {
    dispatch({ type: 'OPEN_EVENT_SIDEBAR', payload: event });
  };

  const handleCloseSidebar = () => {
    dispatch({ type: 'CLOSE_EVENT_SIDEBAR' });
  };

  const handleBulkAddClick = () => {
    setShowBulkAdd(true);
  };

  const handleCloseBulkAdd = () => {
    setShowBulkAdd(false);
  };

  const handleOpenTemplateManager = () => {
    dispatch({ type: 'OPEN_TEMPLATE_MANAGER' });
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
                  <Button onClick={handleExport}>
                    Export to CSV
                  </Button>
                  <Button onClick={handleBulkAddClick}>
                    Bulk Add Partners
                  </Button>
                  <Button onClick={handleOpenTemplateManager}>
                    Manage Templates
                  </Button>
                  <ApiKeyManager />
                </div>
                <ScheduleGenerator onGenerate={handleGenerateSchedule} />
                <CalendarView onEventClick={handleEventClick} />
              </div>
            </div>

            {state.eventSidebarOpen && (
              <EventSidebar event={state.selectedEvent} onClose={handleCloseSidebar} />
            )}
            {state.partnerSidebarOpen && (
              <PartnerSidebar
                isOpen={state.partnerSidebarOpen}
                selectedPartner={state.selectedPartner}
                dispatch={dispatch}
              />
            )}
            {state.templateManagerOpen && (
              <TemplateManager
                templates={state.templates}
                setTemplates={(templates) => dispatch({ type: 'SET_TEMPLATES', payload: templates })}
                onClose={() => dispatch({ type: 'CLOSE_TEMPLATE_MANAGER' })}
              />
            )}
            {showBulkAdd && <BulkAddPartners onClose={handleCloseBulkAdd} />}
          </div>
        </AppContext.Provider>
      </PGliteProvider>
    </ToastProvider>
  );
};