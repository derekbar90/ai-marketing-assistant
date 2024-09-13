import { useContext, useState } from 'react';
import { createOpenAIInstance } from '../index';
import { useSelfPartnerData } from '../../hooks/useSelfPartnerData';

export const useContentGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { queryEmbeddedFiles, loading: selfDataLoading, error: selfDataError } = useSelfPartnerData();
  const generateContent = async (
    event,
    selectedTemplate,
    contentSize,
    additionalContext,
    actualAdditionalContext,
    idea
  ) => {
    setIsLoading(true);
    console.log('Generating content for event:', event);

    try {
      const client = createOpenAIInstance();

      // Fetch relevant self-partner data using embeddings
      const selfPartnerDocuments = await queryEmbeddedFiles(event.contentType);
      if (selfDataError) throw new Error(selfDataError);

      // Build the initial prompt from the perspective of the "self" partner
      const initialPrompt = buildInitialPrompt({
        event,
        selectedTemplate,
        additionalContext,
        actualAdditionalContext,
        idea,
        contentSize,
        selfPartnerDocuments,
      });

      // Estimate max tokens based on desired content size in words
      const tokensPerWord = 1.5; // Approximate conversion factor
      const maxTokens = Math.floor(contentSize * tokensPerWord);

      // Initial content generation
      const initialResponse = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: initialPrompt },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
        n: 1,
        stop: null,
      });

      const initialContent = initialResponse.choices[0].message.content.trim();
      console.log('Initial generated content:', initialContent);

      // Reflective loop: Ask the model to review and improve its own output
      const reflectionPrompt = buildReflectionPrompt({
        event,
        initialContent,
        contentSize,
        selfPartnerDocuments,
      });

      const reflectionResponse = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: reflectionPrompt },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
        n: 1,
        stop: null,
      });

      const finalContent = reflectionResponse.choices[0].message.content.trim();
      console.log('Final generated content after reflection:', finalContent);

      return finalContent;
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading: isLoading || selfDataLoading, generateContent };
};

// System prompt to set the assistant's behavior
const systemPrompt = `
You are a highly skilled AI assistant specialized in generating marketing content for co-marketing and cross-posting initiatives.
You create content from the perspective of our company, aka the partner which is the publisher of the self context, highlighting collaborations with our partners.
, highlighting collaborations with our partners.
Your goal is to produce engaging, relevant, and original content that promotes both the user and the partner, tailored to the provided event details.
Maintain a tone that aligns with both the writing user brand and the partner's brand.
`.trim();

// Helper function to build the initial prompt
const buildInitialPrompt = ({
  event,
  selectedTemplate,
  additionalContext,
  actualAdditionalContext,
  idea,
  contentSize,
  selfPartnerDocuments,
}) => {
  const eventDate = new Date(event.date).toDateString();

  // Format self-partner documents into context
  const selfPartnerContext = selfPartnerDocuments
    .map((doc) => `File: ${doc.filename}\nContent: ${doc.content}`)
    .join('\n\n');

  return `
Please generate ${event.contentType} content for a co-marketing initiative from the perspective of writing user (our company), featuring our partner "${event.partner.name}".

**Self (Our Company) Context:**
${selfPartnerContext || 'No self-partner data available.'}

**Partner Details:**
- **Name:** ${event.partner.name}
- **Brand Voice:** ${event.partner.brandVoice || 'Dynamic and forward-thinking.'}
- **Key Messages:** ${event.partner.keyMessages || 'Quality, reliability, and value.'}

**Event Details:**
- **Content Type:** ${event.contentType}
- **Time Slot:** ${event.timeSlot}
- **Date:** ${eventDate}

**Partner's Recent Activity:**
${additionalContext || 'No recent activity provided.'}

**User Provided Context:**
${actualAdditionalContext || 'No additional context provided.'}

**Content Idea:**
${idea || 'No specific idea provided.'}

**Template:**
${selectedTemplate.content}

**Instructions:**
- Create content that promotes both the writing user and the partner in a co-marketing context.
- Highlight the collaboration and mutual benefits.
- Maintain a tone that aligns with both brands.
- Incorporate key messages and brand voices.
- Ensure the content is suitable for cross-posting on both companies' platforms.
- The content should be original and adhere to all guidelines.
- Aim for a length of approximately ${contentSize} words.
- Format the content appropriately for the specified content type.

Please generate the content below:
`.trim();
};

// Helper function to build the reflection prompt
const buildReflectionPrompt = ({
  event,
  initialContent,
  contentSize,
  selfPartnerDocuments,
}) => {
  // Reuse the self-partner context if needed in reflection
  const selfPartnerContext = selfPartnerDocuments
    .map((doc) => `File: ${doc.filename}\nContent: ${doc.content}`)
    .join('\n\n');

  return `
Review the following ${event.contentType} content generated for a co-marketing initiative between the writing user (our company) and "${event.partner.name}".

**Self (Our Company) Context:**
${selfPartnerContext || 'No writing user data available.'}

**Generated Content:**
${initialContent}

**Instructions:**
- Analyze the content for coherence, tone, and alignment with both brands.
- Ensure that the collaboration and mutual benefits are effectively highlighted.
- Make improvements to enhance engagement and relevance.
- Verify that the content is suitable for cross-posting on both companies' platforms.
- Ensure adherence to all guidelines and absence of disallowed content.
- The final content should be approximately ${contentSize} words.

Please provide the improved content below:
`.trim();
};
