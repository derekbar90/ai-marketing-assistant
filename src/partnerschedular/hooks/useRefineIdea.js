import { useState, useContext } from 'react';
import { createOpenAIInstance } from '../index';
import { useSelfPartnerData } from '../../hooks/useSelfPartnerData';
import { AppContext } from '../index';

export const useRefineIdea = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [refinedIdea, setRefinedIdea] = useState(null);
  const { state } = useContext(AppContext);
  const { queryEmbeddedFiles, loading: selfDataLoading, error: selfDataError } = useSelfPartnerData();

  const refineIdea = async (idea, additionalContext) => {
    setIsLoading(true);
    console.log('Refining idea:', idea);

    try {
      const client = createOpenAIInstance();
      const selfData = await queryEmbeddedFiles(`${idea.title} ${idea.brief}`, 20);

      console.log("🧙‍♂️ 🔎 -> ~ refineIdea ~ selfData:", selfData)
      const systemPrompt = `
      You are an AI assistant specialized in refining content ideas. The provided ideas are for a partner of the user. You will be provided user context, and partner context to improve and expand upon the idea. 
      The goal is to see how the user and relate to the partner and provide support around the dynamics of the idea.
      Return the refined idea as a JSON object with the following structure: { title: string, template: string, topic: string, relevance: number, brief: string, additionalSuggestions: string[] }`;

      const userPrompt = `Initial Idea: ${JSON.stringify(idea)}
      User Context: ${selfData}
      Partner Context: ${additionalContext}`;

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

      const result = JSON.parse(response.choices[0].message.content);
      setRefinedIdea(result);
      return result;
    } catch (error) {
      console.error('Error in idea refinement process:', error);
      setRefinedIdea(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading: isLoading || selfDataLoading, refinedIdea, refineIdea };
};