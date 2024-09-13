import React, { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';

export const Settings = () => {
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [typefullyApiKey, setTypefullyApiKey] = useState('');

  useEffect(() => {
    setOpenaiApiKey(localStorage.getItem('chatgptApiKey') || '');
    setTypefullyApiKey(localStorage.getItem('typefullyApiKey') || '');
  }, []);

  const handleSave = () => {
    localStorage.setItem('chatgptApiKey', openaiApiKey);
    localStorage.setItem('typefullyApiKey', typefullyApiKey);
    // You can add a toast notification here to confirm the save
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="openai-api-key">OpenAI API Key</Label>
        <Input
          id="openai-api-key"
          type="password"
          value={openaiApiKey}
          onChange={(e) => setOpenaiApiKey(e.target.value)}
          placeholder="Enter your OpenAI API key"
        />
      </div>
      <div>
        <Label htmlFor="typefully-api-key">Typefully API Key</Label>
        <Input
          id="typefully-api-key"
          type="password"
          value={typefullyApiKey}
          onChange={(e) => setTypefullyApiKey(e.target.value)}
          placeholder="Enter your Typefully API key"
        />
      </div>
      <Button onClick={handleSave}>Save API Keys</Button>
    </div>
  );
};