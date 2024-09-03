import React, { useState, useContext } from 'react';
import { AppContext } from './index';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';

export const BulkAddPartners = ({ onClose }) => {
  const { dispatch } = useContext(AppContext);
  const [bulkInput, setBulkInput] = useState('');

  const handleBulkAdd = () => {
    const lines = bulkInput.split('\n');
    lines.forEach(line => {
      const [name, color, weight, twitter] = line.split(',').map(item => item.trim());
      if (name && color && weight) {
        const newPartner = { 
          id: Date.now() + Math.random(), 
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

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>Bulk Add Partners</CardTitle>
          <Button onClick={onClose} className="absolute top-2 right-2">Close</Button>
        </CardHeader>
        <CardContent>
          <Textarea 
            value={bulkInput} 
            onChange={(e) => setBulkInput(e.target.value)} 
            placeholder="Enter partners as 'name, color, weight, twitter' on each line" 
            rows={10}
          />
          <Button onClick={handleBulkAdd} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Bulk Add Partners
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};