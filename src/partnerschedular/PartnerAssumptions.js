import React, { useState, useContext } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useOpenAI } from '../hooks/useOpenAI';
import { usePartnerEmbeddedFiles } from '../hooks/usePartnerEmbeddedFiles';
import { createOpenAIInstance } from './index';
import { AppContext } from './index';

export const PartnerAssumptions = ({}) => {
  const { state, dispatch } = useContext(AppContext);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [newAssumption, setNewAssumption] = useState('');
  const [error, setError] = useState(null);
  const [assumptionType, setAssumptionType] = useState('');
  const [previousAssumptions, setPreviousAssumptions] = useState(null);
  const apiKey = localStorage.getItem('chatgptApiKey');
  const { getCompletion } = useOpenAI(apiKey);
  const selectedPartner = state.selectedEvent?.partner || state.selectedPartner;
  const partner = selectedPartner ? state.partners.find(p => p.id === selectedPartner.id) : null;
  const { queryEmbeddedFiles, generatePrompt } = usePartnerEmbeddedFiles(partner?.id, apiKey);

  const generateAssumptions = async () => {
    if (!partner) {
      setError('No partner selected');
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const query = `Generate a list of assumptions about the partner focusing on ${assumptionType || 'general aspects'}`;
      const results = await queryEmbeddedFiles(query);
      
      if (results.length === 0) {
        throw new Error('No relevant files found for the partner');
      }

      const client = createOpenAIInstance();

      const systemPrompt = `You are an AI assistant specialized in generating insightful assumptions about business partners based on provided information. Your task is to:

      1. Carefully review the partner information provided.
      2. Generate 5 distinct, concise assumptions focusing on ${assumptionType || 'the partner\'s general business aspects'}.
      3. Ensure each assumption is no more than 10 words long.
      4. Focus specifically on ${assumptionType || 'the partner\'s goals and long-term plans'}.
      5. Provide a high-level overview without speculating beyond the given information.
      
      Return the assumptions as a JSON array of objects with the following structure:
      { 
        "assumptions": [
          { "assumption": "string" },
          ...
        ] 
      }
      
      If there's insufficient information to make any assumptions, return an empty array.
      
      Important: Do not invent or assume information not present in the provided data.`;
      
      const userPrompt = `Partner: ${partner.name}
      
      Partner Information:
      ${results.map(data => `File: ${data.filename}
      Content: ${data.content}`).join('\n\n')}
      
      Based on this information, please generate 5 concise assumptions about ${assumptionType || 'the partner\'s general business aspects'}.`;

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
      const newAssumptions = parsedResponse.assumptions;

      if (!Array.isArray(newAssumptions)) {
        throw new Error('Generated assumptions are not in the correct format');
      }


      dispatch({
        type: 'ADD_PARTNER_ASSUMPTIONS',
        payload: { partnerId: partner.id, assumptions: newAssumptions },
      });
      
    } catch (error) {
      console.error('Error generating assumptions:', error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const refineAssumptions = async () => {
    if (!partner || !partner.assumptions || partner.assumptions.length === 0) {
      setError('No assumptions to refine');
      return;
    }

    setIsRefining(true);
    setError(null);
    try {
      // Store the current assumptions before refining
      setPreviousAssumptions(partner.assumptions);

      const client = createOpenAIInstance();

      const systemPrompt = `You are an AI assistant specialized in refining and improving assumptions about business partners. Your task is to:

      1. Review the current list of assumptions about the partner.
      2. Refine and improve these assumptions, making them more specific, actionable, or insightful.
      3. Ensure each refined assumption is no more than 15 words long.
      4. You may combine, split, or completely rewrite assumptions if it improves their quality.
      5. Aim to provide a set of 5-7 high-quality, diverse assumptions.
      
      Return the refined assumptions as a JSON array of objects with the following structure:
      { 
        "assumptions": [
          { "assumption": "string" },
          ...
        ] 
      }`;
      
      const userPrompt = `Partner: ${partner.name}
      
      Current Assumptions:
      ${partner.assumptions.map(a => a.assumption).join('\n')}
      
      Please refine and improve these assumptions about the partner.`;

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
      const refinedAssumptions = parsedResponse.assumptions;

      if (!Array.isArray(refinedAssumptions)) {
        throw new Error('Refined assumptions are not in the correct format');
      }

      dispatch({
        type: 'UPDATE_PARTNER_ASSUMPTIONS',
        payload: { partnerId: partner.id, assumptions: refinedAssumptions },
      });
      
    } catch (error) {
      console.error('Error refining assumptions:', error);
      setError(error.message);
      setPreviousAssumptions(null);
    } finally {
      setIsRefining(false);
    }
  };

  const undoRefinement = () => {
    if (previousAssumptions) {
      dispatch({
        type: 'UPDATE_PARTNER_ASSUMPTIONS',
        payload: { partnerId: partner.id, assumptions: previousAssumptions },
      });
      setPreviousAssumptions(null);
    }
  };

  const addAssumption = () => {
    if (newAssumption.trim()) {
      dispatch({
        type: 'ADD_PARTNER_ASSUMPTION',
        payload: { partnerId: partner.id, assumption: { assumption: newAssumption.trim() } },
      });
      
      setNewAssumption('');
    }
  };

  const removeAssumption = (index) => {
    const updatedPartner = {
      ...partner,
      assumptions: partner.assumptions.filter((_, i) => i !== index),
    };
    dispatch({
      type: 'REMOVE_PARTNER_ASSUMPTION',
      payload: { partnerId: partner.id, index },
    });
    
  };

  if (!partner) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Partner Assumptions</h3>
        <p>Please select a partner to view and manage assumptions.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Partner Assumptions</h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            value={assumptionType}
            onChange={(e) => setAssumptionType(e.target.value)}
            placeholder="Assumption type (e.g., business objectives)"
            className="flex-grow"
          />
          <Button 
            onClick={generateAssumptions} 
            disabled={isGenerating}
            className="whitespace-nowrap"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex items-center space-x-2">
          <Input
            value={newAssumption}
            onChange={(e) => setNewAssumption(e.target.value)}
            placeholder="New assumption"
            className="flex-grow"
          />
          <Button onClick={addAssumption}>Add</Button>
        </div>
      </div>

      {partner.assumptions && partner.assumptions.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-2">Current Assumptions</h4>
          <ul className="space-y-2">
            {partner.assumptions.map((assumption, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm">{assumption.assumption}</span>
                <Button 
                  onClick={() => removeAssumption(index)} 
                  variant="ghost" 
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {partner.assumptions && partner.assumptions.length > 0 && (
        <div className="mt-4 space-y-2">
          <Button 
            onClick={refineAssumptions} 
            disabled={isRefining}
            className="w-full"
          >
            {isRefining ? 'Refining...' : 'Refine Assumptions'}
          </Button>
          {previousAssumptions && (
            <Button 
              onClick={undoRefinement}
              className="w-full"
              variant="outline"
            >
              Undo Refinement
            </Button>
          )}
        </div>
      )}
    </div>
  );
};