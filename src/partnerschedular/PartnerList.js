import React, { useContext, useState } from 'react';
import { AppContext } from './index';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { SketchPicker } from 'react-color';

// Function to generate a random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const PartnerList = () => {
  const { state, dispatch } = useContext(AppContext);
  const [partnerName, setPartnerName] = useState('');
  const [partnerColor, setPartnerColor] = useState(getRandomColor());

  const handleAddPartner = () => {
    const newPartner = { id: Date.now(), name: partnerName, color: partnerColor, weight: 1 };
    dispatch({ type: 'ADD_PARTNER', payload: newPartner });
    setPartnerName('');
    setPartnerColor(getRandomColor());
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Partner List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-2">
          <Input 
            value={partnerName} 
            onChange={(e) => setPartnerName(e.target.value)} 
            placeholder="Enter partner name" 
          />
          <SketchPicker 
            color={partnerColor} 
            onChangeComplete={(color) => setPartnerColor(color.hex)} 
          />
          <Button onClick={handleAddPartner}>
            <Plus className="mr-2" /> Add Partner
          </Button>
        </div>
        <ul>
          {state.partners.map(partner => (
            <li key={partner.id} className="flex justify-between items-center">
              <span style={{ color: partner.color }}>{partner.name}</span>
              <Button onClick={() => dispatch({ type: 'REMOVE_PARTNER', payload: partner.id })}>
                <Trash2 className="mr-2" /> Remove
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};