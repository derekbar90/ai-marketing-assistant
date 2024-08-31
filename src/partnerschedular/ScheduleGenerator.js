import React, { useContext } from 'react';
import { AppContext } from './index'; // Update this import
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label'; // Assuming you have a Label component
import { Calendar } from 'lucide-react';

export const ScheduleGenerator = ({ onGenerate }) => {
  const { state, dispatch } = useContext(AppContext);

  const handleContentTypeChange = (value) => {
    dispatch({
      type: 'UPDATE_PREFERENCES',
      payload: { contentType: value }
    });
  };

  const handleBlogLimitChange = (e) => {
    dispatch({
      type: 'UPDATE_PREFERENCES',
      payload: { blogLimitPerWeek: parseInt(e.target.value, 10) }
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Generate Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 mb-2">
          <div>
            <Label htmlFor="content-type">Content Type</Label>
            <Select 
              id="content-type"
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
          </div>
          <div>
            <Label htmlFor="blog-limit">Blogs per Week</Label>
            <Input 
              id="blog-limit"
              type="number" 
              value={state.preferences.blogLimitPerWeek} 
              onChange={handleBlogLimitChange} 
              placeholder="Blogs per week" 
            />
          </div>
          <Button onClick={onGenerate}>
            <Calendar className="mr-2" /> Generate Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};