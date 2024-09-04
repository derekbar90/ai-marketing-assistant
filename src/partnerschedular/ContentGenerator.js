// ContentGenerator.js
import React, { useState, useContext } from 'react';
import OpenAI from 'openai';
import ReactMarkdown from 'react-markdown';
import { Button } from '../components/ui/button';
import { AppContext } from './index';

export const ContentGenerator = ({ event, selectedTemplate, contentSize, additionalContext, actualAdditionalContext }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useContext(AppContext);

  const handleGenerateContent = async (idea) => {
    setIsLoading(true);
    console.log('Generating content for event:', event);
  
    try {
      const apiKey = localStorage.getItem('chatgptApiKey');
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
  
  Recent Partner (Tweets): ${additionalContext}

  User Provided Context: ${actualAdditionalContext}
  
  Content Idea: ${idea}
  
  Please generate content that fits this template and these event details. 
  The content should be engaging, relevant, and tailored to the specific partner and content type.`;

      const maxTokens = contentSize;
  
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
      });
  
      const content = response.choices[0].message.content;
      console.log('Generated content:', content);
  
      dispatch({ type: 'UPDATE_EVENT_CONTENT', payload: { id: event.id, content, isApproved: false } });
  
      return true;
    } catch (error) {
      console.error('Error generating content:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button 
        onClick={() => handleGenerateContent()} 
        className="mb-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Generating Content...' : 'Generate Content'}
      </Button>
      {event.generatedContent && (
        <div className="mt-4 p-2 border rounded bg-gray-100">
          <h3 className="text-lg font-bold">Generated Content</h3>
          <ReactMarkdown>{event.generatedContent}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};