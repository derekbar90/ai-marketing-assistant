import { useState } from 'react';
import OpenAI from 'openai';

export const useContentIdeas = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [contentIdeas, setContentIdeas] = useState([]);

  const generateIdeas = async (event, selectedTemplate, additionalContext, actualAdditionalContext) => {
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
      return ideas;
    } catch (error) {
      console.error('Error generating or parsing content ideas:', error);
      setContentIdeas([]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, contentIdeas, generateIdeas };
};