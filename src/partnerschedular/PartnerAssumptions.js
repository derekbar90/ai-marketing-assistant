import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useOpenAI } from '../hooks/useOpenAI';
import { usePartnerEmbeddedFiles } from '../hooks/usePartnerEmbeddedFiles';

export const PartnerAssumptions = ({ partner, dispatch, onUpdate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [newAssumption, setNewAssumption] = useState('');
  const [error, setError] = useState(null);  // Add this line
  const apiKey = localStorage.getItem('chatgptApiKey');
  const { getCompletion } = useOpenAI(apiKey);
  const { queryEmbeddedFiles, generatePrompt } = usePartnerEmbeddedFiles(partner.id, apiKey);

  const generateAssumptions = async () => {
    setIsGenerating(true);
    setError(null);  // Reset error state
    try {
      const query = "Generate a list of assumptions about the partner";
      const results = await queryEmbeddedFiles(query);
      
      if (results.length === 0) {
        throw new Error('No relevant files found for the partner');
      }

      const prompt = generatePrompt(query, results);
      const completion = await getCompletion(prompt);
      
      let assumptions;
      try {
        assumptions = JSON.parse(completion);
        if (!Array.isArray(assumptions)) {
          throw new Error('Generated assumptions are not in the correct format');
        }
      } catch (error) {
        console.error('Error parsing assumptions:', error);
        assumptions = completion.split('\n').filter(line => line.trim() !== '').map(line => ({ assumption: line.trim() }));
      }

      const updatedPartner = {
        ...partner,
        assumptions: assumptions,
      };
      dispatch({
        type: 'SET_PARTNER_ASSUMPTIONS',
        payload: { partnerId: partner.id, assumptions },
      });
      onUpdate(updatedPartner);
    } catch (error) {
      console.error('Error generating assumptions:', error);
      setError(error.message);  // Set error state
    } finally {
      setIsGenerating(false);
    }
  };

  const addAssumption = () => {
    if (newAssumption.trim()) {
      const updatedPartner = {
        ...partner,
        assumptions: [...(partner.assumptions || []), { assumption: newAssumption.trim() }],
      };
      dispatch({
        type: 'ADD_PARTNER_ASSUMPTION',
        payload: { partnerId: partner.id, assumption: { assumption: newAssumption.trim() } },
      });
      onUpdate(updatedPartner);
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
    onUpdate(updatedPartner);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="font-bold mb-2">Partner Assumptions</h3>
      <Button onClick={generateAssumptions} disabled={isGenerating} className="mb-2">
        {isGenerating ? 'Generating...' : 'Generate Assumptions'}
      </Button>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="mb-2">
        <Input
          value={newAssumption}
          onChange={(e) => setNewAssumption(e.target.value)}
          placeholder="Add new assumption"
          className="mb-1"
        />
        <Button onClick={addAssumption}>Add Assumption</Button>
      </div>
      <ul className="list-disc pl-5">
        {partner.assumptions?.map((assumption, index) => (
          <li key={index} className="mb-1 flex justify-between items-center">
            <span>{assumption.assumption}</span>
            <Button onClick={() => removeAssumption(index)} variant="destructive" size="sm">
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};