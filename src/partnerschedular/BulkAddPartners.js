import React, { useState, useContext } from 'react';
import { AppContext } from './index';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { v4 as uuid } from 'uuid';

export const BulkAddPartners = ({ onClose }) => {
  const { dispatch, state } = useContext(AppContext);
  const [bulkInput, setBulkInput] = useState('');

  const handleBulkAdd = () => {
    const lines = bulkInput.split('\n');
    lines.forEach(line => {
      const [name, color, weight, twitter] = line.split(',').map(item => item.trim());
      if (name && color && weight) {
        const newPartner = { 
          id: uuid(), 
          name, 
          color, 
          weight: parseInt(weight, 10),
          twitter: twitter || '' // Add Twitter handle if provided
        };
        dispatch({ type: 'ADD_PARTNER', payload: newPartner });
      }
    });
    onClose();
  };

  const handleCopyPartners = () => {
    const partnerString = state.partners
      .map(partner => `${partner.name},${partner.color},${partner.weight},${partner.twitter || ''}`)
      .join('\n');
    
    navigator.clipboard.writeText(partnerString).then(() => {
      alert('Partners data copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-1/2">
        <CardHeader>
          <div className='flex flex-row justify-between mb-4'>
            <CardTitle>Bulk Add Partners</CardTitle>
            <Button onClick={onClose}>Close</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea 
            value={bulkInput} 
            onChange={(e) => setBulkInput(e.target.value)} 
            placeholder="Enter partners as 'name, color, weight, twitter' on each line" 
            rows={10}
          />
          <div className="flex justify-between mt-4">
            <Button onClick={handleBulkAdd} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Bulk Add Partners
            </Button>
            <Button onClick={handleCopyPartners} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Copy Partners
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};