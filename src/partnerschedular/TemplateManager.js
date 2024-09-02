import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Modal } from '../components/ui/Modal';

export const TemplateManager = ({ templates, setTemplates, onClose }) => {
  const [newTemplate, setNewTemplate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const handleAddTemplate = () => {
    if (isEditing) {
      const updatedTemplates = [...templates];
      updatedTemplates[editIndex] = newTemplate;
      setTemplates(updatedTemplates);
      setIsEditing(false);
      setEditIndex(null);
    } else {
      setTemplates([...templates, newTemplate]);
    }
    setNewTemplate('');
  };

  const handleEditTemplate = (index) => {
    setNewTemplate(templates[index]);
    setIsEditing(true);
    setEditIndex(index);
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <h2 className="text-xl font-bold mb-2">Manage Templates</h2>
      <textarea
        value={newTemplate}
        onChange={(e) => setNewTemplate(e.target.value)}
        placeholder="Add new template"
        className="mb-2 p-2 border rounded w-full h-32"
      />
      <Button onClick={handleAddTemplate} className="mb-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
        {isEditing ? 'Update Template' : 'Add Template'}
      </Button>
      <h3 className="text-lg font-bold mt-4">Edit Templates</h3>
      <ul>
        {templates.map((template, index) => (
          <li key={index} className="flex justify-between items-center mb-2">
            <span>{template}</span>
            <Button onClick={() => handleEditTemplate(index)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded">
              Edit
            </Button>
          </li>
        ))}
      </ul>
    </Modal>
  );
};