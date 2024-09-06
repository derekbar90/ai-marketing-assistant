// ApiKeyManager.js
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';

export const ApiKeyManager = () => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const storedApiKey = localStorage.getItem('chatgptApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('chatgptApiKey', apiKey);
    alert('API Key saved!');
  };

  return (
    <div className="flex flex-row">
      <input
        type="password"
        value={apiKey}
        onChange={handleApiKeyChange}
        placeholder="Enter API Key"
        className="mb-2 p-2 border rounded w-3/4"
      />
      <Button 
        onClick={handleSaveApiKey} 
        className="mb-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
      >
        Save API Key
      </Button>
    </div>
  );
};