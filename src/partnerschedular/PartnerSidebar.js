import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { SketchPicker } from 'react-color';
import { Trash2, ChevronRight, ChevronLeft, Upload, File, Eye, Download } from 'lucide-react';
import { usePGlite } from '@electric-sql/pglite-react';
import { useDropzone } from 'react-dropzone';
import { Toast } from '../components/ui/toast';

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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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

      setIsOpen(false);
      setSelectedPartner(null);
    }
  };

  const handleUploadFiles = async () => {
    setIsUploading(true);
    for (const file of uploadedFiles) {
      if (file.content) {
        try {
          await db.query(`
            INSERT INTO partner_files (partner_id, filename, content)
            VALUES ($1, $2, $3);
          `, [selectedPartner.id, file.name, file.content]);
        } catch (error) {
          console.error('Error inserting file:', error);
          setToast({ show: true, message: `Error uploading ${file.name}`, type: 'error' });
        }
      }
    }
    await fetchFiles();
    setUploadedFiles([]);
    setIsUploading(false);
    setToast({ show: true, message: 'Files uploaded successfully', type: 'success' });
  };

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      name: file.name,
      content: null
    }));
    setUploadedFiles(prevFiles => [...prevFiles, ...newFiles]);

    acceptedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFiles(prevFiles => prevFiles.map((f, i) => 
          i === index + prevFiles.length - acceptedFiles.length
            ? { ...f, content: reader.result }
            : f
        ));
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: 'text/*',
    multiple: true
  });

  const handleDeleteFile = async (fileId) => {
    try {
      await db.query(`DELETE FROM partner_files WHERE id = $1;`, [fileId]);
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleFileView = async (fileId) => {
    try {
      const result = await db.query(`SELECT content FROM partner_files WHERE id = $1;`, [fileId]);
      if (result.rows.length > 0) {
        // Open a modal or a new window to display the file content
        console.log('File content:', result.rows[0].content);
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      setToast({ show: true, message: 'Error viewing file', type: 'error' });
    }
  };

  const handleFileDownload = async (fileId, filename) => {
    try {
      const result = await db.query(`SELECT content FROM partner_files WHERE id = $1;`, [fileId]);
      if (result.rows.length > 0) {
        const blob = new Blob([result.rows[0].content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      setToast({ show: true, message: 'Error downloading file', type: 'error' });
    }
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
      <Button 
        className="absolute top-4 -left-10" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronRight /> : <ChevronLeft />}
      </Button>
      {selectedPartner && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Edit Partner</h2>
          
          {/* Partner Information Section */}
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
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
            
            {/* Color Picker */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Partner Color</label>
              <div 
                className="w-10 h-10 cursor-pointer mb-1 rounded-md border border-gray-300" 
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
            
            {/* Weight Slider */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Partner Weight: {selectedPartner.weight}</label>
              <Slider
                defaultValue={[selectedPartner.weight]}
                max={100}
                step={1}
                onValueChange={(newValue) => setSelectedPartner({...selectedPartner, weight: newValue[0]})}
              />
            </div>
          </div>
          
          {/* File Upload Section */}
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-bold mb-2">Upload Files</h3>
            <div {...getRootProps()} className="border-2 border-dashed p-4 mb-2 cursor-pointer rounded-md hover:bg-gray-200 transition-colors">
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto mb-2" />
                  <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
              )}
            </div>
            {uploadedFiles.length > 0 && (
              <div className="mt-2">
                <h4 className="font-semibold mb-1">Files to upload:</h4>
                <ul className="list-disc pl-5">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="text-sm">
                      {file.name} {file.content ? '(Ready)' : '(Loading...)'}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={handleUploadFiles} 
                  className="mt-2" 
                  disabled={isUploading || uploadedFiles.some(file => !file.content)}
                >
                  {isUploading ? 'Uploading...' : 'Upload Files'}
                </Button>
              </div>
            )}
          </div>
          
          {/* Partner Files Section */}
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-bold mb-2">Partner Files:</h3>
            {files.length === 0 ? (
              <p className="text-gray-500">No files uploaded yet.</p>
            ) : (
              files.map((file) => (
                <div key={file.id} className="flex items-center justify-between mb-2 bg-white p-2 rounded-md">
                  <div className="flex items-center">
                    <File className="mr-2" size={16} />
                    <span className="truncate max-w-[150px]">{file.filename}</span>
                  </div>
                  <div>
                    <Button onClick={() => handleFileView(file.id)} variant="ghost" size="sm" className="mr-1">
                      <Eye size={16} />
                    </Button>
                    <Button onClick={() => handleFileDownload(file.id, file.filename)} variant="ghost" size="sm" className="mr-1">
                      <Download size={16} />
                    </Button>
                    <Button onClick={() => handleDeleteFile(file.id)} variant="destructive" size="sm">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button onClick={handleUpdatePartner} className="flex-grow mr-2">
              Update Partner
            </Button>
            <Button onClick={() => dispatch({ type: 'REMOVE_PARTNER', payload: selectedPartner.id })} variant="destructive" className="flex-grow">
              <Trash2 className="mr-2" /> Remove Partner
            </Button>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};