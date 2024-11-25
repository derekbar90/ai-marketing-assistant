import React, { useContext, useState } from 'react';
import { Button } from '../components/ui/button';
import { AppContext } from './index';
import { useContentIdeas } from './hooks/useContentIdeas';
import { useRefineIdea } from './hooks/useRefineIdea';
import { Tweet } from '../components/ui/tweet';

export const ContentIdeas = ({ event, selectedTemplate, additionalContext, actualAdditionalContext, onSelectIdea }) => {
  const { dispatch } = useContext(AppContext);
  const { isLoading, contentIdeas, generateIdeas } = useContentIdeas();
  const { isLoading: isRefining, refinedIdea, refineIdea } = useRefineIdea();
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showRelevantDocs, setShowRelevantDocs] = useState({});

  const handleGenerateIdeas = async () => {
    try {
      await generateIdeas(event, selectedTemplate, additionalContext, actualAdditionalContext);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate content ideas. Please try again.' });
    }
  };

  const handleSelectIdea = (idea) => {
    setSelectedIdea(idea);
    onSelectIdea(idea);
  };

  const handleRefineIdea = async () => {
    if (selectedIdea) {
      try {
        const refined = await refineIdea(selectedIdea, additionalContext);
        setSelectedIdea(refined);
        onSelectIdea(refined);
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to refine idea. Please try again.' });
      }
    }
  };

  const toggleRelevantDocs = (ideaId) => {
    setShowRelevantDocs(prev => ({
      ...prev,
      [ideaId]: !prev[ideaId]
    }));
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
      {selectedIdea && (
        <div className="mt-4 p-4 border rounded bg-blue-100">
          <h3 className="text-lg font-bold mb-2">Selected Idea</h3>
          <h4 className="font-bold text-blue-700">{selectedIdea.title}</h4>
          <p className="text-sm text-gray-600 mt-1"><strong>Topic:</strong> {selectedIdea.topic}</p>
          <p className="text-sm text-gray-600"><strong>Template:</strong> {selectedIdea.template}</p>
          <p className="text-sm text-gray-600"><strong>Relevance:</strong> {(selectedIdea.relevance * 100).toFixed(1)}%</p>
          <p className="text-sm text-gray-600 mt-2"><strong>Brief:</strong> {selectedIdea.brief}</p>
          {selectedIdea.additionalSuggestions && (
            <div className="mt-2">
              <strong>Additional Suggestions:</strong>
              <ul className="list-disc list-inside">
                {selectedIdea.additionalSuggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-600">{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          {selectedIdea.relevantDocumentIds && (
            <div className="mt-2">
              <Button
                onClick={() => toggleRelevantDocs('selected')}
                className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2 rounded"
              >
                {showRelevantDocs['selected'] ? 'Hide' : 'Show'} Relevant Documents
              </Button>
              {showRelevantDocs['selected'] && (
                <ul className="list-disc list-inside mt-2">
                  {selectedIdea.relevantDocumentIds.map((id, index) => (
                    <Tweet key={index} tweetId={id} />
                  ))}
                </ul>
              )}
            </div>
          )}
          <Button 
            onClick={handleRefineIdea} 
            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            disabled={isRefining}
          >
            {isRefining ? 'Refining...' : 'Refine Idea'}
          </Button>
        </div>
      )}
      {contentIdeas.length > 0 && (
        <div className="mt-4 p-2 border rounded bg-gray-100">
          <h3 className="text-lg font-bold">Content Ideas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentIdeas
              .sort((a, b) => b.relevance - a.relevance)
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
                {idea.relevantDocumentIds && (
                  <div className="mt-2">
                    <Button
                      onClick={() => toggleRelevantDocs(index)}
                      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2 rounded"
                    >
                      {showRelevantDocs[index] ? 'Hide' : 'Show'} Relevant Documents
                    </Button>
                    {showRelevantDocs[index] && (
                      <ul className="list-disc list-inside mt-2">
                        {idea.relevantDocumentIds.map((id, docIndex) => (
                          <Tweet key={docIndex} tweetId={id} />
                        ))}
                      </ul>
                    )}
                  </div>
                )}
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