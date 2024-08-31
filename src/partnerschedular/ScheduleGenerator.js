import React, { useContext } from 'react';
import { AppContext } from './index'; // Update this import
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar } from 'lucide-react';

export const ScheduleGenerator = ({ onGenerate }) => {
  const { state, dispatch } = useContext(AppContext);

  const handleContentTypeChange = (value) => {
    dispatch({
      type: 'UPDATE_PREFERENCES',
      payload: { contentType: value }
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Generate Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-2">
          <Select 
            value={state.preferences.contentType} 
            onValueChange={handleContentTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              {state.preferences.contentTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onGenerate}>
            <Calendar className="mr-2" /> Generate Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};