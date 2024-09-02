import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { TemplateManager } from './TemplateManager';

export const EventSidebar = ({ event, onClose, onGenerateContent }) => {
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [templates, setTemplates] = useState(['Template 1', 'Template 2']);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('chatgptApiKey') || '');

  useEffect(() => {
    if (event && event.generatedContent) {
      setGeneratedContent(event.generatedContent);
    } else {
      setGeneratedContent('');
    }
  }, [event]);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('chatgptApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  if (!event) return null;

  const handleOpenTemplateManager = () => {
    setIsTemplateManagerOpen(true);
  };

  const handleCloseTemplateManager = () => {
    setIsTemplateManagerOpen(false);
  };

  const handleGenerateContent = async () => {
    const isValid = await onGenerateContent(selectedTemplate, apiKey, event);
    if (isValid) {
      const client = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });

      try {
        const response = await client.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: `${selectedTemplate}\n\nEvent Details:\nPartner: ${event.partner.name}\nContent Type: ${event.contentType}\nTime Slot: ${event.timeSlot}\nDate: ${new Date(event.date).toDateString()}` }],
        });

        const content = response.choices[0].message.content;
        setGeneratedContent(content);
        event.generatedContent = content; // Save the generated content to the event
        localStorage.setItem(`event_${event.id}_content`, content); // Persist the content
        return true;
      } catch (error) {
        console.error('Error generating content:', error);
        return false;
      }
    }
  };

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
          <Button onClick={handleGenerateContent} className="mb-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
            Generate Content
          </Button>
          <Button onClick={handleOpenTemplateManager} className="mb-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
            Manage Templates
          </Button>
          {generatedContent && (
            <div className="mt-4 p-2 border rounded bg-gray-100">
              <h3 className="text-lg font-bold">Generated Content</h3>
              <p>{generatedContent}</p>
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