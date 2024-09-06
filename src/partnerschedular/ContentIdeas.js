import React, { useContext } from 'react';
import { Button } from '../components/ui/button';
import { AppContext } from './index';
import { useContentIdeas } from './hooks/useContentIdeas';

export const ContentIdeas = ({ event, selectedTemplate, additionalContext, actualAdditionalContext, onSelectIdea }) => {
  const { dispatch } = useContext(AppContext);
  const { isLoading, contentIdeas, generateIdeas } = useContentIdeas();

  const handleGenerateIdeas = async () => {
    try {
      await generateIdeas(event, selectedTemplate, additionalContext, actualAdditionalContext);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate content ideas. Please try again.' });
    }
  };

  const handleSelectIdea = (idea) => {
    onSelectIdea(idea);
  };

  return (
    <div>
      <Button 
        onClick={handleGenerateIdeas} 
        className="mb-2 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Generating Ideas...' : 'Generate Content Ideas'}
      </Button>
      {contentIdeas.length > 0 && (
        <div className="mt-4 p-2 border rounded bg-gray-100">
          <h3 className="text-lg font-bold">Content Ideas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentIdeas
              .sort((a, b) => b.weight - a.weight)
              .map((idea, index) => (
              <div key={index} className="p-2 border-l-4 border-blue-500 rounded bg-gray-50">
                <h4 className="font-bold text-blue-700">{idea.title}</h4>
                <div className="flex items-center mt-1">
                  <span className="inline-block bg-blue-200 text-blue-800 text-xs px-1 rounded-full uppercase font-semibold tracking-wide">
                    Topic
                  </span>
                  <p className="text-xs text-gray-600 ml-1">{idea.topic}</p>
                </div>
                <div className="flex items-center mt-1">
                  <span className="inline-block bg-purple-200 text-purple-800 text-xs px-1 rounded-full uppercase font-semibold tracking-wide">
                    Template
                  </span>
                  <p className="text-xs text-gray-600 ml-1">{idea.template}</p>
                </div>
                <div className="flex items-center mt-1">
                  <span className="inline-block bg-green-200 text-green-800 text-xs px-1 rounded-full uppercase font-semibold tracking-wide">
                    Relevance
                  </span>
                  <p className="text-xs text-gray-600 ml-1">{(idea.relevance * 100).toFixed(1)}%</p>
                </div>
                <Button 
                  onClick={() => handleSelectIdea(idea)} 
                  className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded w-full text-xs"
                >
                  Select This Idea
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};