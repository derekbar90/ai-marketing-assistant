import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from './index';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { SketchPicker } from 'react-color';
import { Slider } from '../components/ui/slider';
import { PartnerSidebar } from './PartnerSidebar';
import { v4 as uuid } from 'uuid';
import { User } from 'lucide-react';

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
  const [partnerWeight, setPartnerWeight] = useState(1);
  const [partnerTwitter, setPartnerTwitter] = useState(''); // New state for Twitter handle
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    console.log('saving');
    localStorage.setItem('appState', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    // Check if the "Self" partner exists, if not, add it
    if (!state.partners.some(partner => partner.id === 'self')) {
      const selfPartner = {
        id: 'self',
        name: 'Self',
        color: '#000000', // You can choose any default color
        weight: 1,
        twitter: '' // You can set your own Twitter handle here
      };
      dispatch({ type: 'ADD_PARTNER', payload: selfPartner });
    }
  }, []);

  const handleAddPartner = () => {
    const newPartner = { 
      id: uuid(), 
      name: partnerName, 
      color: partnerColor, 
      weight: partnerWeight,
      twitter: partnerTwitter // Add Twitter handle to new partner
    };
    dispatch({ type: 'ADD_PARTNER', payload: newPartner });
    setPartnerName('');
    setPartnerColor(getRandomColor());
    setPartnerWeight(1);
    setPartnerTwitter(''); // Reset Twitter handle input
    setShowColorPicker(false);
  };

  const handleWeightChange = (id, newWeight) => {
    const updatedPartner = { ...state.partners.find(partner => partner.id === id), weight: newWeight };
    dispatch({ type: 'UPDATE_PARTNER_WEIGHT', payload: updatedPartner });
  };

  const handleTwitterChange = (id, newTwitter) => {
    const updatedPartner = { ...state.partners.find(partner => partner.id === id), twitter: newTwitter };
    dispatch({ type: 'UPDATE_PARTNER_TWITTER', payload: updatedPartner });
  };

  const handleEditPartner = (partner) => {
    dispatch({ type: 'OPEN_PARTNER_SIDEBAR', payload: partner });
  };

  return (
    <div className="flex">
      <Card className="mb-6 flex-grow">
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
            <Input 
              value={partnerTwitter} 
              onChange={(e) => setPartnerTwitter(e.target.value)} 
              placeholder="Enter Twitter handle" 
            />
            <div className="relative">
              <div 
                className="w-10 h-10 cursor-pointer" 
                style={{ backgroundColor: partnerColor }} 
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              {showColorPicker && (
                <div className="absolute z-10">
                  <SketchPicker 
                    color={partnerColor} 
                    onChangeComplete={(color) => setPartnerColor(color.hex)} 
                  />
                </div>
              )}
            </div>
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
          <ul className="space-y-4">
            {Array.isArray(state.partners) && state.partners.map(partner => (
              <li key={partner.id} className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {partner.id === 'self' ? (
                    <User className="w-6 h-6 text-gray-600" />
                  ) : (
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-gray-300" 
                      style={{ backgroundColor: partner.color }} 
                    />
                  )}
                  <div className="flex flex-col w-[150px]">
                    <span className="text-lg font-semibold">{partner.name}</span>
                    {partner.twitter && (
                      <a 
                        href={`https://twitter.com/${partner.twitter}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        @{partner.twitter}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4 w-full">
                  <Slider
                    defaultValue={[partner.weight]}
                    max={100}
                    step={1}
                    onValueChange={(newValue) => handleWeightChange(partner.id, newValue[0])}
                    className="w-full"
                  />
                  <Button 
                    onClick={() => handleEditPartner(partner)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Edit
                  </Button>
                  {partner.id !== 'self' && (
                    <Button 
                      onClick={() => dispatch({ type: 'REMOVE_PARTNER', payload: partner.id })}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <PartnerSidebar 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        selectedPartner={selectedPartner}
        setSelectedPartner={setSelectedPartner}
        dispatch={dispatch}
        showColorPicker={showColorPicker}
        setShowColorPicker={setShowColorPicker}
      />
    </div>
  );
};