// EventSidebar.js
import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { TemplateManager } from './TemplateManager';
import { AppContext } from './index';
import { useEventData } from './hooks/useEventData';
import { ContentIdeas } from './ContentIdeas';
import { TwitterTimeline } from './twitterTimeline';
import { useContentGenerator } from './hooks/useContentGenerator';
import ReactMarkdown from 'react-markdown';

const EventDetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

export const EventSidebar = ({ event, onClose }) => {
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [contentSize, setContentSize] = useState(500);
  const [additionalContext, setAdditionalContext] = useState('');
  const [actualAdditionalContext, setActualAdditionalContext] = useState('');

  const { state, dispatch } = useContext(AppContext);
  const { isApproved, setIsApproved } = useEventData(event);
  const { generateContent, isLoading } = useContentGenerator();

  // useEffect(() => {
  //   console.log('Event in EventSidebar:', event);
  // }, [event]);

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

  const handleSelectIdea = async (idea) => {
    try {
      const content = await generateContent(event, selectedTemplate, contentSize, additionalContext, actualAdditionalContext, idea.title);
      dispatch({
        type: 'UPDATE_EVENT_CONTENT',
        payload: {
          id: event.id,
          content,
          isApproved: false,
          selectedIdea: idea
        }
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate content. Please try again.' });
    }
  };

  const handleGenerateContent = async () => {
    try {
      const content = await generateContent(event, selectedTemplate, contentSize, additionalContext, actualAdditionalContext);
      dispatch({
        type: 'UPDATE_EVENT_CONTENT',
        payload: {
          id: event.id,
          content,
          isApproved: false
        }
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate content. Please try again.' });
    }
  };


  // Find the most up-to-date event data from the state
  const currentEvent = state.schedule.find(e => e.id === event.id) || event;

  return (
    <div className="fixed top-0 left-0 w-2/3 h-full bg-white shadow-lg z-50">
      <Card className="h-full overflow-auto">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <Button onClick={onClose} className="absolute top-2 right-2">Close</Button>
        </CardHeader>
        <CardContent>

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
            <div className="flex flex-row space-x-4">
                
              <textarea
                value={actualAdditionalContext}
                onChange={(e) => setActualAdditionalContext(e.target.value)}
                placeholder="Enter actual additional context"
                className="mb-2 p-2 border rounded w-1/2"
              />
              <div className="w-1/2">
                <TwitterTimeline twitterHandle={event.partner.twitter} />
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Enter additional context (Tweets)"
                  className="mb-2 p-2 border rounded w-full"
                />
              </div>
            </div>
          </div>


          <select
            value={selectedTemplate?.title || ''}
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

          <Button
            onClick={handleGenerateContent}
            className="mb-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Generating Content...' : 'Generate Content'}
          </Button>

          {currentEvent.generatedContent && (
            <div className="mt-4 p-2 border rounded bg-gray-100">
              <h3 className="text-lg font-bold">Generated Content</h3>
              {currentEvent.selectedIdea && <p><strong>Selected Idea:</strong> {currentEvent.selectedIdea.title}</p>}
              <ReactMarkdown>{currentEvent.generatedContent}</ReactMarkdown>
            </div>
          )}

          <ContentIdeas
            event={event}
            selectedTemplate={selectedTemplate}
            additionalContext={additionalContext}
            actualAdditionalContext={actualAdditionalContext}
            onSelectIdea={handleSelectIdea}
          />

          <Button
            onClick={handleApproveContent}
            className="mb-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
            disabled={!isApproved && !currentEvent.generatedContent}
          >
            {(!isApproved && !currentEvent.generatedContent) ? 'Approved' : 'Approve Content'}
          </Button>

          <Button onClick={handleOpenTemplateManager} className="mb-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
            Manage Templates
          </Button>
        </CardContent>
      </Card>
      {isTemplateManagerOpen && (
        <TemplateManager onClose={handleCloseTemplateManager} />
      )}
    </div>
  );
};