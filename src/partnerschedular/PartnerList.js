import React, { useContext, useState } from 'react';
import { AppContext } from './index';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { SketchPicker } from 'react-color';
import { Slider } from '../components/ui/slider';

// Function to generate a random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Function to balance weights
const balanceWeights = (partners, updatedPartner) => {
  const totalWeight = 100;
  const remainingWeight = totalWeight - updatedPartner.weight;
  const otherPartners = partners.filter(partner => partner.id !== updatedPartner.id);
  const weightPerPartner = remainingWeight / otherPartners.length;

  return otherPartners.map(partner => ({
    ...partner,
    weight: weightPerPartner
  }));
};

export const PartnerList = () => {
  const { state, dispatch } = useContext(AppContext);
  const [partnerName, setPartnerName] = useState('');
  const [partnerColor, setPartnerColor] = useState(getRandomColor());
  const [partnerWeight, setPartnerWeight] = useState(1);

  const handleAddPartner = () => {
    const newPartner = { id: Date.now(), name: partnerName, color: partnerColor, weight: partnerWeight };
    dispatch({ type: 'ADD_PARTNER', payload: newPartner });
    setPartnerName('');
    setPartnerColor(getRandomColor());
    setPartnerWeight(1);
  };

  const handleWeightChange = (id, newWeight) => {
    const updatedPartner = { ...state.partners.find(partner => partner.id === id), weight: newWeight };
    const balancedPartners = balanceWeights(state.partners, updatedPartner);
    dispatch({ type: 'UPDATE_PARTNER_WEIGHT', payload: { updatedPartner, balancedPartners } });
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
          <Slider
            defaultValue={[partnerWeight]}
            max={100}
            step={1}
            onValueChange={(newValue) => setPartnerWeight(newValue[0])}
          />
          <Button onClick={handleAddPartner}>
            <Plus className="mr-2" /> Add Partner
          </Button>
        </div>
        <ul>
          {state.partners.map(partner => (
            <li key={partner.id} className="flex justify-between items-center">
              <span style={{ color: partner.color }}>{partner.name}</span>
              <Slider
                defaultValue={[partner.weight]}
                max={100}
                step={1}
                onValueChange={(newValue) => handleWeightChange(partner.id, newValue[0])}
              />
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