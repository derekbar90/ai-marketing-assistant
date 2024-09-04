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
    setSelectedPartner(partner);
    setSidebarOpen(true);
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
          <ul>
            {Array.isArray(state.partners) && state.partners.map(partner => (
              <li key={partner.id} className="flex justify-between items-center mb-2">
                <div className="flex items-center mr-4 border-2 border-gray-300 rounded-md p-2">
                  <div 
                    className="w-4 h-4 rounded-full border mr-2" 
                    style={{ backgroundColor: partner.color }} 
                  />
                  <span className="text-lg">{partner.name}</span>
                  {partner.twitter && (
                    <a 
                      href={`https://twitter.com/${partner.twitter}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ml-2 text-blue-500"
                    >
                      @{partner.twitter}
                    </a>
                  )}
                </div>
                <Slider
                  defaultValue={[partner.weight]}
                  max={100}
                  step={1}
                  onValueChange={(newValue) => handleWeightChange(partner.id, newValue[0])}
                  className="w-32 mx-4"
                />
                <Button onClick={() => handleEditPartner(partner)}>
                  Edit
                </Button>
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