import React, { useState, useContext } from 'react';
import OpenAI from 'openai';
import { Button } from '../components/ui/button';
import { AppContext } from './index';

export const ContentIdeas = ({ event, selectedTemplate, additionalContext, actualAdditionalContext }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [contentIdeas, setContentIdeas] = useState([]);
  const { dispatch } = useContext(AppContext);

  const handleGenerateIdeas = async () => {
    setIsLoading(true);
    console.log('Generating content ideas for event:', event);
  
    try {
      const apiKey = localStorage.getItem('chatgptApiKey');
      const client = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });
  
      const systemPrompt = `You are an AI assistant specialized in generating content ideas for posts. Review the tweets and additional context and provide ideas with a title, topic, and weight for relevance in the partner's marketing.
      Ensure the ideas are appropriate for the partner, content type, and occasion. Provide as many ideas as possible.
      The weight should be a number between 0 and 1, indicating how heavily the theme is being pushed in the partner's recent tweets.
      Provide the ideas as a JSON array of objects with the following structure: 
      { ideas: [{ title: string, topic: string, weight: number }, ...] }`;
  
      const userPrompt = `Template: ${selectedTemplate.content}
  
  Partner: ${event.partner.name}
  Content Type: ${event.contentType}
  
  Recent Partner (Tweets): ${additionalContext}
  
  User Provided Context: ${actualAdditionalContext}
  `;
  
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });
  
      const responseContent = response.choices[0].message.content;
      const parsedResponse = JSON.parse(responseContent);
      const ideas = parsedResponse.ideas;
      if (!Array.isArray(ideas)) {
        throw new Error('Invalid response format');
      }
      console.log('Generated content ideas:', ideas);
  
      setContentIdeas(ideas);
    } catch (error) {
      console.error('Error generating or parsing content ideas:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate content ideas. Please try again.' });
      setContentIdeas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectIdea = (idea) => {
    // You might want to pass this up to the parent component or handle it here
    console.log('Selected idea:', idea);
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
                  <span className="inline-block bg-green-200 text-green-800 text-xs px-1 rounded-full uppercase font-semibold tracking-wide">
                    Relevance
                  </span>
                  <p className="text-xs text-gray-600 ml-1">{(idea.weight * 100).toFixed(1)}%</p>
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