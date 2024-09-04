import { useState } from 'react';
import OpenAI from 'openai';

export const useContentGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);

  const generateContent = async (event, selectedTemplate, contentSize, additionalContext, actualAdditionalContext, idea) => {
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

      return content;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, generateContent };
};