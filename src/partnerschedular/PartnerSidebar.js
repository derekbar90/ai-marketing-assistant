import React from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { SketchPicker } from 'react-color';
import { Trash2, ChevronRight, ChevronLeft } from 'lucide-react';

export const PartnerSidebar = ({ 
  isOpen, 
  setIsOpen, 
  selectedPartner, 
  setSelectedPartner, 
  dispatch, 
  showColorPicker, 
  setShowColorPicker 
}) => {
  const handleUpdatePartner = () => {
    if (selectedPartner) {
      dispatch({ type: 'UPDATE_PARTNER_WEIGHT', payload: selectedPartner });
      dispatch({ type: 'UPDATE_PARTNER_TWITTER', payload: selectedPartner });
      setIsOpen(false);
      setSelectedPartner(null);
    }
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <Button 
        className="absolute top-4 -left-10" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronRight /> : <ChevronLeft />}
      </Button>
      {selectedPartner && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Edit Partner</h2>
          <Input 
            value={selectedPartner.name} 
            onChange={(e) => setSelectedPartner({...selectedPartner, name: e.target.value})} 
            placeholder="Partner name" 
            className="mb-2"
          />
          <Input 
            value={selectedPartner.twitter || ''} 
            onChange={(e) => setSelectedPartner({...selectedPartner, twitter: e.target.value})} 
            placeholder="Twitter handle" 
            className="mb-2"
          />
          <div className="mb-2">
            <div 
              className="w-10 h-10 cursor-pointer mb-1" 
              style={{ backgroundColor: selectedPartner.color }} 
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            {showColorPicker && (
              <SketchPicker 
                color={selectedPartner.color} 
                onChangeComplete={(color) => setSelectedPartner({...selectedPartner, color: color.hex})} 
              />
            )}
          </div>
          <Slider
            defaultValue={[selectedPartner.weight]}
            max={100}
            step={1}
            onValueChange={(newValue) => setSelectedPartner({...selectedPartner, weight: newValue[0]})}
            className="mb-2"
          />
          <Button onClick={handleUpdatePartner} className="mr-2">
            Update
          </Button>
          <Button onClick={() => dispatch({ type: 'REMOVE_PARTNER', payload: selectedPartner.id })} variant="destructive">
            <Trash2 className="mr-2" /> Remove
          </Button>
        </div>
      )}
    </div>
  );
};