import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { SketchPicker } from 'react-color';
import { Trash2, ChevronRight, ChevronLeft, Upload, File } from 'lucide-react';
import { usePGlite } from '@electric-sql/pglite-react';
import { useDropzone } from 'react-dropzone';

export const PartnerSidebar = ({ 
  isOpen, 
  setIsOpen, 
  selectedPartner, 
  setSelectedPartner, 
  dispatch, 
  showColorPicker, 
  setShowColorPicker 
}) => {
  const db = usePGlite();
  const [fileContent, setFileContent] = useState('');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (db) {
      createPartnerFilesTable();
    }
  }, [db]);

  useEffect(() => {
    if (selectedPartner) {
      fetchFiles();
    }
  }, [selectedPartner]);

  const createPartnerFilesTable = async () => {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS partner_files (
          id SERIAL PRIMARY KEY,
          partner_id TEXT,
          filename TEXT,
          content TEXT
        );
      `);
      console.log('partner_files table created or already exists');
    } catch (error) {
      console.error('Error creating partner_files table:', error);
    }
  };

  const fetchFiles = async () => {
    if (db && selectedPartner) {
      try {
        const result = await db.query(`
          SELECT id, filename FROM partner_files WHERE partner_id = $1;
        `, [selectedPartner.id]);
        setFiles(result.rows);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    }
  };

  const handleUpdatePartner = async () => {
    if (selectedPartner) {
      dispatch({ type: 'UPDATE_PARTNER_WEIGHT', payload: selectedPartner });
      dispatch({ type: 'UPDATE_PARTNER_TWITTER', payload: selectedPartner });

      // Store file content in PGlite
      if (fileContent) {
        try {
          await db.query(`
            INSERT INTO partner_files (partner_id, filename, content)
            VALUES ($1, $2, $3);
          `, [selectedPartner.id, 'uploaded_file.txt', fileContent]);
          await fetchFiles();
        } catch (error) {
          console.error('Error inserting file:', error);
        }
      }

      setIsOpen(false);
      setSelectedPartner(null);
      setFileContent('');
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setFileContent(reader.result);
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'text/*' });

  const handleDeleteFile = async (fileId) => {
    try {
      await db.query(`DELETE FROM partner_files WHERE id = $1;`, [fileId]);
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
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
          <div {...getRootProps()} className="border-2 border-dashed p-4 mb-2 cursor-pointer">
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag 'n' drop some files here, or click to select files</p>
            )}
            {fileContent && <p className="mt-2">File content loaded!</p>}
          </div>
          <div className="mb-4">
            <h3 className="font-bold mb-2">Partner Files:</h3>
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <File className="mr-2" size={16} />
                  <span>{file.filename}</span>
                </div>
                <Button onClick={() => handleDeleteFile(file.id)} variant="destructive" size="sm">
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
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