import React, { useState, useContext } from 'react';
import { Button } from '../components/ui/button';
import { Modal } from '../components/ui/Modal';
import { AppContext } from './index'; // Import AppContext

export const TemplateManager = ({ onClose }) => {
  const { state, dispatch } = useContext(AppContext); // Get state and dispatch from context
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const handleAddTemplate = () => {
    if (isEditing) {
      dispatch({
        type: 'UPDATE_TEMPLATE',
        payload: { index: editIndex, template: { title: newTemplateTitle, content: newTemplateContent } },
      });
      setIsEditing(false);
      setEditIndex(null);
    } else {
      dispatch({
        type: 'ADD_TEMPLATE',
        payload: { title: newTemplateTitle, content: newTemplateContent },
      });
    }
    setNewTemplateTitle('');
    setNewTemplateContent('');
  };

  const handleEditTemplate = (index) => {
    setNewTemplateTitle(state.templates[index].title);
    setNewTemplateContent(state.templates[index].content);
    setIsEditing(true);
    setEditIndex(index);
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <h2 className="text-xl font-bold mb-2">Manage Templates</h2>
      <input
        type="text"
        value={newTemplateTitle}
        onChange={(e) => setNewTemplateTitle(e.target.value)}
        placeholder="Template Title"
        className="mb-2 p-2 border rounded w-full"
      />
      <textarea
        value={newTemplateContent}
        onChange={(e) => setNewTemplateContent(e.target.value)}
        placeholder="Template Content"
        className="mb-2 p-2 border rounded w-full h-32"
      />
      <Button onClick={handleAddTemplate} className="mb-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
        {isEditing ? 'Update Template' : 'Add Template'}
      </Button>
      <h3 className="text-lg font-bold mt-4">Edit Templates</h3>
      <ul>
        {state.templates.map((template, index) => (
          <li key={index} className="flex justify-between items-center mb-2">
            <div>
              <strong>{template.title}</strong>
              <p>{template.content}</p>
            </div>
            <Button onClick={() => handleEditTemplate(index)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded">
              Edit
            </Button>
          </li>
        ))}
      </ul>
    </Modal>
  );
};