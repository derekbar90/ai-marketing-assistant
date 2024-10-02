import 'react-quill/dist/quill.snow.css';
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
import { Settings } from './Settings'; // Import the Settings component
import OpenAI from 'openai';

import { PGlite } from "@electric-sql/pglite"
import { live } from "@electric-sql/pglite/live"
import { vector } from "@electric-sql/pglite/vector"
import { PGliteProvider } from "@electric-sql/pglite-react"
import { ToastProvider } from '../components/ui/toast';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { AlertCircle } from 'lucide-react';

const db = await PGlite.create({
  extensions: { live, vector },
  dataDir: 'idb://my-pgdata'
})

export const AppContext = createContext();

export const createOpenAIInstance = () => new OpenAI({ apiKey: localStorage.getItem('chatgptApiKey'), dangerouslyAllowBrowser: true });

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

    // Create partner_tweets table
    await db.query(`
      CREATE TABLE IF NOT EXISTS partner_tweets (
        id TEXT PRIMARY KEY,
        partner_id TEXT,
        date TIMESTAMP,
        content TEXT,
        username TEXT,
        handle TEXT,
        reply_count INTEGER,
        retweet_count INTEGER,
        like_count INTEGER,
        view_count INTEGER,
        image_url TEXT,
        is_verified BOOLEAN,
        embedding vector(1536)
      );
    `);

    // Create index for partner_tweets
    await db.query(`
      CREATE INDEX IF NOT EXISTS partner_tweets_embedding_idx 
      ON partner_tweets USING hnsw (embedding vector_ip_ops);
    `);
    
    console.log('App migrations completed successfully');
  } catch (error) {
    console.error('Error in runAppMigrations:', error);
  }
};

export const PartnerSchedulingApp = () => {
  const [state, dispatch] = useReducer(appReducer, loadStateFromLocalStorage());
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // Add this line

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
    checkApiKey();
  }, []);

  const checkApiKey = () => {
    const apiKey = localStorage.getItem('chatgptApiKey');
    setIsApiKeyMissing(!apiKey);
  };

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

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  return (
    <ToastProvider>
      <PGliteProvider db={db}>
        <AppContext.Provider value={{ state, dispatch }}>
          <div className="p-4 mx-14 mx-auto">
            <h1 className="text-2xl font-bold mb-4">Partner Content Scheduling App</h1>

            {isApiKeyMissing && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Missing API Key</AlertTitle>
                <AlertDescription>
                  Please set your OpenAI API key in the API Key Manager to use AI features.
                </AlertDescription>
              </Alert>
            )}

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
                  <Button onClick={handleOpenSettings}>
                    Settings
                  </Button>
                </div>
                <ScheduleGenerator onGenerate={handleGenerateSchedule} />
                <CalendarView onEventClick={handleEventClick} />
              </div>
            </div>

            {showSettings && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <h2 className="text-xl font-bold mb-4">Settings</h2>
                  <Settings />
                  <Button onClick={handleCloseSettings} className="mt-4">
                    Close
                  </Button>
                </div>
              </div>
            )}

            {state.eventSidebarOpen && (
              <EventSidebar event={state.selectedEvent} onClose={handleCloseSidebar} />
            )}
            {state.partnerSidebarOpen && (
              <PartnerSidebar
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