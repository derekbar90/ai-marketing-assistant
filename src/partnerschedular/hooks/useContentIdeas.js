import { useContext, useState } from 'react';
import { createOpenAIInstance } from '../index';
import { useSelfPartnerData } from '../../hooks/useSelfPartnerData';
import { AppContext } from '../index';

export const useContentIdeas = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [contentIdeas, setContentIdeas] = useState([]);
  const { state } = useContext(AppContext);
  const { queryEmbeddedFiles, loading: selfDataLoading, error: selfDataError } = useSelfPartnerData();

  const templates = state.templates;

  const analyzeContext = async (client, tweets, additionalContext) => {
    const systemPrompt = `You are an AI assistant specialized in analyzing social media content and context. Review the provided tweets and additional context to identify key themes, important events, and upcoming dates. Provide as much supporting details for each. Provide a summary of your findings.`;
    
    const userPrompt = `Tweets: ${tweets}\n\nAdditional Context: ${additionalContext}`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    return response.choices[0].message.content;
  };

  const createIdeas = async (client, event, contextAnalysis, selfData, additionalContext) => {
    const systemPrompt = `You are an AI assistant specialized in generating initial content ideas for posts. Use the provided context analysis, template, self partner data, and additional context to generate content ideas. Each idea should include a title, topic, a create brief, template and relevance. Provide as many ideas as possible. Relevance is a number between 0 and 1, indicating how well the idea aligns with the partner's recent content, data, and additional context. Return the ideas as a JSON array of objects with the following structure: 
    { ideas: [{ title: string, template: string, topic: string, relevance: number, brief: string }, ...] }.`;

    const userPrompt = `Templates: ${templates.map(template => template.title).join(', ')}
    Partner: ${event.partner.name}
    Content Type: ${event.contentType}
    Context Analysis: ${contextAnalysis}
    Context About the Authoring Partner: ${selfData}
    Additional Context: ${additionalContext}`;

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

    return JSON.parse(response.choices[0].message.content).ideas;
  };

  const refineIdeas = async (client, initialIdeas, selfData, additionalContext) => {
    const systemPrompt = `You are an AI assistant specialized in refining content ideas. Review the initial ideas, self partner data, and additional context to assign a relevance weight to each idea. The weight should be a number between 0 and 1, indicating how well the idea aligns with the partner's recent content, data, and additional context. Provide the refined ideas as a JSON array of objects with the following structure: { ideas: [{ title: string, template: string, topic: string, relevance: number, brief: string }, ...] }`;

    const userPrompt = `Initial Ideas: ${JSON.stringify(initialIdeas)}
    Self Partner Data: ${selfData}
    Additional Context: ${additionalContext}`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content).ideas;
  };

  const generateIdeas = async (event, selectedTemplate, additionalContext, actualAdditionalContext) => {
    setIsLoading(true);
    console.log('Generating content ideas for event:', event);

    try {
      const client = createOpenAIInstance();

      // Step 1: Analyze context
      const contextAnalysis = await analyzeContext(client, additionalContext, actualAdditionalContext);
      console.log("🧙‍♂️ 🔎 -> ~ generateIdeas ~ contextAnalysis:", contextAnalysis)
      
      // Step 2: Generate initial ideas
      const initialIdeasWithoutContext = await createIdeas(client, event, contextAnalysis, '', additionalContext);
      
      const initialIdeas = [...initialIdeasWithoutContext];

      const results = initialIdeas;

      setContentIdeas(results);
      return results;
    } catch (error) {
      console.error('Error in content idea generation process:', error);
      setContentIdeas([]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading: isLoading || selfDataLoading, contentIdeas, generateIdeas };
};