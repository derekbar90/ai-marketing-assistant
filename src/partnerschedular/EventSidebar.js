import React, { useState, useEffect, useContext } from 'react';
import OpenAI from 'openai';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { TemplateManager } from './TemplateManager';
import { AppContext } from './index'; // Import AppContext

export const EventSidebar = ({ event, onClose, onGenerateContent }) => {
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [templates, setTemplates] = useState(['Template 1', 'Template 2']);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('chatgptApiKey') || '');
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const { state, dispatch } = useContext(AppContext); // Get state and dispatch from context

  useEffect(() => {
    const storedApiKey = localStorage.getItem('chatgptApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  useEffect(() => {
    // Re-render when event prop changes
    console.log('Event prop changed:', event); // Log the event object
  }, [event]);

  if (!event) return null;

  const handleOpenTemplateManager = () => {
    setIsTemplateManagerOpen(true);
  };

  const handleCloseTemplateManager = () => {
    setIsTemplateManagerOpen(false);
  };

  const handleGenerateContent = async () => {
    setIsLoading(true); // Set loading state to true
    console.log('Generating content for event:', event); // Log the event object
    const isValid = await onGenerateContent(selectedTemplate, apiKey, event);
    if (isValid) {
      const client = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });

      try {
        const response = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: `${selectedTemplate}\n\nEvent Details:\nPartner: ${event.partner.name}\nContent Type: ${event.contentType}\nTime Slot: ${event.timeSlot}\nDate: ${new Date(event.date).toDateString()}` }],
        });

        const content = response.choices[0].message.content;
        console.log('Generated content:', content); // Log the generated content

        // Dispatch action to update the event content in the state
        dispatch({ type: 'UPDATE_EVENT_CONTENT', payload: { id: event.id, content } });

        setIsLoading(false); // Set loading state to false
        return true;
      } catch (error) {
        console.error('Error generating content:', error);
        setIsLoading(false); // Set loading state to false
        return false;
      }
    } else {
      setIsLoading(false); // Set loading state to false
    }
  };

  // Find the updated event from the state
  const updatedEvent = state.schedule.find(e => e.id === event.id);

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
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="mb-2 p-2 border rounded w-full"
          >
            <option value="" disabled>Select a template</option>
            {templates.map((template, index) => (
              <option key={index} value={template}>{template}</option>
            ))}
          </select>
          <Button 
            onClick={handleGenerateContent} 
            className="mb-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? 'Generating...' : 'Generate Content'}
          </Button>
          <Button onClick={handleOpenTemplateManager} className="mb-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
            Manage Templates
          </Button>
          {updatedEvent && updatedEvent.generatedContent && (
            <div className="mt-4 p-2 border rounded bg-gray-100">
              <h3 className="text-lg font-bold">Generated Content</h3>
              <p>{updatedEvent.generatedContent}</p>
            </div>
          )}
        </CardContent>
      </Card>
      {isTemplateManagerOpen && (
        <TemplateManager
          templates={templates}
          setTemplates={setTemplates}
          onClose={handleCloseTemplateManager}
        />
      )}
    </div>
  );
};