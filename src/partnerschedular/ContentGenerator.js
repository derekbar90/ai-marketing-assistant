// ContentGenerator.js
import React, { useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '../components/ui/button';
import { AppContext } from './index';
import { useContentGenerator } from './hooks/useContentGenerator';

export const ContentGenerator = ({ event, selectedTemplate, contentSize, additionalContext, actualAdditionalContext }) => {
  const { dispatch } = useContext(AppContext);
  const { isLoading, generateContent } = useContentGenerator();

  const handleGenerateContent = async (idea) => {
    try {
      const content = await generateContent(event, selectedTemplate, contentSize, additionalContext, actualAdditionalContext, idea);
      dispatch({ type: 'UPDATE_EVENT_CONTENT', payload: { id: event.id, content, isApproved: false } });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    }
  };

  return (
    <div>
      <Button 
        onClick={() => handleGenerateContent(event.selectedIdea?.title)} 
        className="mb-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Generating Content...' : 'Generate Content'}
      </Button>
      {event.generatedContent && (
        <div className="mt-4 p-2 border rounded bg-gray-100">
          <h3 className="text-lg font-bold">Generated Content</h3>
          <p><strong>Selected Idea:</strong> {event.selectedIdea?.title}</p>
          <ReactMarkdown>{event.generatedContent}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};