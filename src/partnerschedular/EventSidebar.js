import React, { useState, useEffect, useContext } from 'react';
import OpenAI from 'openai';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { TemplateManager } from './TemplateManager';
import { AppContext } from './index'; // Import AppContext

export const EventSidebar = ({ event, onClose, onGenerateContent }) => {
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [templates, setTemplates] = useState([{ title: 'Template 1', content: 'Content 1' }, { title: 'Template 2', content: 'Content 2' }]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('chatgptApiKey') || '');
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [isApproved, setIsApproved] = useState(false); // Initialize with false

  const { state, dispatch } = useContext(AppContext); // Get state and dispatch from context

  useEffect(() => {
    const storedApiKey = localStorage.getItem('chatgptApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  useEffect(() => {
    if (event) {
      setIsApproved(event.isApproved || false); // Update approval state when event changes
      console.log('Event prop changed:', event); // Log the event object
    }
  }, [event]);

  if (!event) return null;

  const handleOpenTemplateManager = () => {
    setIsTemplateManagerOpen(true);
  };

  const handleCloseTemplateManager = () => {
    setIsTemplateManagerOpen(false);
  };

  const handleGenerateContent = async () => {
    setIsLoading(true);
    console.log('Generating content for event:', event);
  
    try {
      const isValid = await onGenerateContent(selectedTemplate, apiKey, event);
      if (!isValid) {
        throw new Error('Invalid generation parameters');
      }
  
      const client = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });
  
      const systemPrompt = `You are an AI assistant specialized in generating content for events. 
      Your task is to create engaging and relevant content based on the provided template and event details. 
      Ensure the content is appropriate for the partner, content type, and occasion.`;
  
      const userPrompt = `Template: ${selectedTemplate.content}
  
  Event Details:
  Partner: ${event.partner.name}
  Content Type: ${event.contentType}
  Time Slot: ${event.timeSlot}
  Date: ${new Date(event.date).toDateString()}
  
  Please generate content that fits this template and these event details. 
  The content should be engaging, relevant, and tailored to the specific partner and content type.`;
  
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });
  
      const content = response.choices[0].message.content;
      console.log('Generated content:', content);
  
      dispatch({ type: 'UPDATE_EVENT_CONTENT', payload: { id: event.id, content, isApproved: false } });
  
      return true;
    } catch (error) {
      console.error('Error generating content:', error);
      // Optionally, you can dispatch an action to update the UI with the error message
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('chatgptApiKey', apiKey);
    alert('API Key saved!');
  };

  const handleApproveContent = () => {
    dispatch({ type: 'APPROVE_EVENT_CONTENT', payload: { id: event.id } });
    setIsApproved(true);
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
            onChange={(e) => setSelectedTemplate(templates.find(template => template.title === e.target.value))}
            className="mb-2 p-2 border rounded w-full"
          >
            <option value="" disabled>Select a template</option>
            {templates.map((template, index) => (
              <option key={index} value={template.title}>{template.title}</option>
            ))}
          </select>
          <input
            type="text"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter API Key"
            className="mb-2 p-2 border rounded w-full"
          />
          <Button 
            onClick={handleSaveApiKey} 
            className="mb-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            Save API Key
          </Button>
          <Button 
            onClick={handleGenerateContent} 
            className="mb-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? 'Generating...' : 'Generate Content'}
          </Button>
          <Button 
            onClick={handleApproveContent} 
            className="mb-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
            disabled={isApproved} // Disable button if already approved
          >
            {isApproved ? 'Approved' : 'Approve Content'}
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