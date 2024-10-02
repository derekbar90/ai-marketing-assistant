import { useState } from 'react';
import { useOpenAIEmbeddings } from '../../hooks/useOpenAIEmbeddings';

export const useRefineIdea = () => {
  const [isRefining, setIsRefining] = useState(false);
  const { generateEmbeddings } = useOpenAIEmbeddings();

  const refineIdea = async (event, comments) => {
    setIsRefining(true);
    try {
      // Here you would typically call your AI service to refine the content
      // For now, we'll just append the comments to the existing content
      const refinedContent = `${event.generatedContent}\n\nRefinements based on feedback:\n${comments}`;
      
      // You might want to generate new embeddings for the refined content
      // await generateEmbeddings(refinedContent);

      return refinedContent;
    } catch (error) {
      console.error('Error refining idea:', error);
      throw error;
    } finally {
      setIsRefining(false);
    }
  };

  return { refineIdea, isRefining };
};