// EventSidebar.js
import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { TemplateManager } from './TemplateManager';
import { AppContext } from './index';
import { useEventData } from './hooks/useEventData';
import { ApiKeyManager } from './ApiKeyManager';
import { ContentGenerator } from './ContentGenerator';
import { ContentIdeas } from './ContentIdeas';
import { TwitterTimeline } from './TwitterTimeline';
import { EventDetails } from './EventDetails';

export const EventSidebar = ({ event, onClose }) => {
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [contentSize, setContentSize] = useState(500);
  const [additionalContext, setAdditionalContext] = useState('');
  const [actualAdditionalContext, setActualAdditionalContext] = useState('');

  const { state, dispatch } = useContext(AppContext);
  const { isApproved, setIsApproved } = useEventData(event);

  const handleOpenTemplateManager = () => setIsTemplateManagerOpen(true);
  const handleCloseTemplateManager = () => setIsTemplateManagerOpen(false);

  const handleApproveContent = () => {
    dispatch({ type: 'APPROVE_EVENT_CONTENT', payload: { id: event.id } });
    setIsApproved(true);
  };

  const contentSizeOptions = [
    { label: 'Micro', value: 50 },
    { label: 'Tiny', value: 100 },
    { label: 'Small', value: 200 },
    { label: 'Twitter', value: 100 },
    { label: 'Medium', value: 500 },
    { label: 'Large', value: 800 },
    { label: 'XL', value: 1200 },
    { label: 'XXL', value: 2000 },
    { label: 'Essay', value: 3000 },
    { label: 'Article', value: 5000 },
    { label: 'Long-form', value: 8000 }
  ];

  if (!event) return null;

  return (
    <div className="fixed top-0 left-0 w-1/3 h-full bg-white shadow-lg z-50">
      <Card className="h-full overflow-auto">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <Button onClick={onClose} className="absolute top-2 right-2">Close</Button>
        </CardHeader>
        <CardContent>
          <EventDetails event={event} />
          
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(state.templates.find(template => template.title === e.target.value))}
            className="mb-2 p-2 border rounded w-full"
          >
            <option value="" disabled>Select a template</option>
            {state.templates && state.templates.map((template, index) => (
              <option key={index} value={template.title}>{template.title}</option>
            ))}
          </select>
          
          <select
            value={contentSize}
            onChange={(e) => setContentSize(parseInt(e.target.value))}
            className="mb-2 p-2 border rounded w-full"
          >
            {contentSizeOptions.map((option) => (
              <option key={option.label} value={option.value}>{option.label}</option>
            ))}
          </select>

          <ApiKeyManager />

          <textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Enter additional context (Tweets)"
            className="mb-2 p-2 border rounded w-full"
          />
          <textarea
            value={actualAdditionalContext}
            onChange={(e) => setActualAdditionalContext(e.target.value)}
            placeholder="Enter actual additional context"
            className="mb-2 p-2 border rounded w-full"
          />

          <ContentGenerator
            event={event}
            selectedTemplate={selectedTemplate}
            contentSize={contentSize}
            additionalContext={additionalContext}
            actualAdditionalContext={actualAdditionalContext}
          />

          <ContentIdeas
            event={event}
            selectedTemplate={selectedTemplate}
            additionalContext={additionalContext}
            actualAdditionalContext={actualAdditionalContext}
          />

          <Button 
            onClick={handleApproveContent} 
            className="mb-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
            disabled={isApproved}
          >
            {isApproved ? 'Approved' : 'Approve Content'}
          </Button>
          
          <Button onClick={handleOpenTemplateManager} className="mb-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
            Manage Templates
          </Button>

          <TwitterTimeline twitterHandle={event.partner.twitter} />
        </CardContent>
      </Card>
      {isTemplateManagerOpen && (
        <TemplateManager onClose={handleCloseTemplateManager} />
      )}
    </div>
  );
};