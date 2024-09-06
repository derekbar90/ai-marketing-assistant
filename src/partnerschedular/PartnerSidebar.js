import React, { useState, useCallback, useEffect, useContext } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { SketchPicker } from 'react-color';
import { Trash2, ChevronRight, ChevronLeft, Upload, File, Eye, Download } from 'lucide-react';
import { usePGlite } from '@electric-sql/pglite-react';
import { useDropzone } from 'react-dropzone';
import { Toast } from '../components/ui/toast';
import { useOpenAIEmbeddings } from '../hooks/useOpenAIEmbeddings';
import { usePartnerEmbeddedFiles } from '../hooks/usePartnerEmbeddedFiles';
import { useOpenAI } from '../hooks/useOpenAI';
import { PartnerAssumptions } from './PartnerAssumptions';
import { AppContext } from './index';
import ReactMarkdown from 'react-markdown';

export function splitText(text, chunkSize = 1000, chunkOverlap = 200) {
  const chunks = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;
    
    // Adjust end index to avoid splitting words
    if (endIndex < text.length) {
      while (endIndex > startIndex && !text[endIndex].match(/\s/)) {
        endIndex--;
      }
    }

    // If we couldn't find a space, just use the original end index
    if (endIndex === startIndex) {
      endIndex = startIndex + chunkSize;
    }

    chunks.push(text.slice(startIndex, endIndex).trim());
    startIndex = endIndex - chunkOverlap;
  }

  return chunks;
}

export const PartnerSidebar = () => {
  const { state, dispatch } = useContext(AppContext);
  const { partnerSidebarOpen, selectedPartner } = state;
  const db = usePGlite();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('chatgptApiKey') || '');
  const { getEmbedding, loading: embeddingLoading, error: embeddingError } = useOpenAIEmbeddings(apiKey);
  const [query, setQuery] = useState('');
  const { queryEmbeddedFiles, results, loading: queryLoading, error: queryError, generatePrompt } = usePartnerEmbeddedFiles(selectedPartner?.id, apiKey);
  const { getCompletion } = useOpenAI(apiKey);
  const [answer, setAnswer] = useState('');
  const [answerLoading, setAnswerLoading] = useState(false);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (selectedPartner) {
      fetchDocuments();
    }
  }, [selectedPartner]);

  const fetchDocuments = async () => {
    if (db && selectedPartner) {
      try {
        console.log('Fetching documents for partner:', selectedPartner.id);
        const result = await db.query(`
          SELECT id, filename, created_at FROM partner_documents WHERE partner_id = $1
          ORDER BY created_at DESC;
        `, [selectedPartner.id]);
        console.log('Fetched documents:', result.rows);
        setDocuments(result.rows);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    }
  };

  const handleUpdatePartner = async () => {
    if (selectedPartner) {
      dispatch({ type: 'UPDATE_PARTNER_WEIGHT', payload: selectedPartner });
      dispatch({ type: 'UPDATE_PARTNER_TWITTER', payload: selectedPartner });
      dispatch({ type: 'CLOSE_PARTNER_SIDEBAR' });
    }
  };

  const handleClose = () => {
    dispatch({ type: 'CLOSE_PARTNER_SIDEBAR' });
  };

  const handleUploadFiles = async () => {
    if (!apiKey) {
      setToast({ show: true, message: 'Please enter an OpenAI API key', type: 'error' });
      return;
    }

    if (!selectedPartner) {
      setToast({ show: true, message: 'No partner selected', type: 'error' });
      return;
    }

    setIsUploading(true);
    for (const file of uploadedFiles) {
      if (file.content) {
        try {
          // Insert document
          const docResult = await db.query(`
            INSERT INTO partner_documents (partner_id, filename)
            VALUES ($1, $2)
            RETURNING id;
          `, [selectedPartner.id, file.name]);
          const documentId = docResult.rows[0].id;

          const chunks = splitText(file.content);
          for (let i = 0; i < chunks.length; i++) {
            const embedding = await getEmbedding(chunks[i]);
            if (embedding) {
              const embeddingString = `[${embedding.join(',')}]`;
              await db.query(`
                INSERT INTO partner_chunks (document_id, content, embedding, chunk_index)
                VALUES ($1, $2, $3::vector, $4);
              `, [documentId, chunks[i], embeddingString, i]);
            } else {
              throw new Error('Failed to get embedding');
            }
          }
          setToast({ show: true, message: `Successfully uploaded ${file.name}`, type: 'success' });
        } catch (error) {
          console.error('Error inserting file:', error);
          setToast({ show: true, message: `Error uploading ${file.name}: ${error.message}`, type: 'error' });
        }
      }
    }
    await fetchDocuments();
    setUploadedFiles([]);
    setIsUploading(false);
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

  const handleDeleteDocument = async (documentId) => {
    try {
      await db.query(`DELETE FROM partner_documents WHERE id = $1;`, [documentId]);
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleDocumentView = async (documentId) => {
    try {
      const result = await db.query(`
        SELECT content FROM partner_chunks 
        WHERE document_id = $1 
        ORDER BY chunk_index;
      `, [documentId]);
      if (result.rows.length > 0) {
        const fullContent = result.rows.map(row => row.content).join('\n');
        // Open a modal or a new window to display the file content
        console.log('Document content:', fullContent);
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      setToast({ show: true, message: 'Error viewing document', type: 'error' });
    }
  };

  const handleDocumentDownload = async (documentId, filename) => {
    try {
      const result = await db.query(`
        SELECT content FROM partner_chunks 
        WHERE document_id = $1 
        ORDER BY chunk_index;
      `, [documentId]);
      if (result.rows.length > 0) {
        const fullContent = result.rows.map(row => row.content).join('\n');
        const blob = new Blob([fullContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      setToast({ show: true, message: 'Error downloading document', type: 'error' });
    }
  };

  const handleApiKeyChange = (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    localStorage.setItem('chatgptApiKey', newApiKey);
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (query.trim()) {
      setAnswerLoading(true);
      try {
        await queryEmbeddedFiles(query);
        const prompt = generatePrompt(query, results);
        const completion = await getCompletion(prompt);
        setAnswer(completion);
      } catch (error) {
        console.error('Error getting answer:', error);
        setToast({ show: true, message: 'Error getting answer', type: 'error' });
      } finally {
        setAnswerLoading(false);
      }
    }
  };

  const handleAssumptionUpdate = (updatedPartner) => {
    dispatch({ type: 'UPDATE_PARTNER', payload: updatedPartner });
  };

  if (!partnerSidebarOpen) return null;

  return (
    <div className={`fixed top-0 right-0 h-full w-1/4 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${partnerSidebarOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
      <Button 
        className="absolute top-4 -left-10" 
        onClick={handleClose}
      >
        <ChevronRight />
      </Button>
      {selectedPartner && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Edit Partner</h2>
          
          {/* Partner Information Section */}
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <Input 
              value={selectedPartner.name} 
              onChange={(e) => dispatch({ type: 'UPDATE_PARTNER', payload: { ...selectedPartner, name: e.target.value } })} 
              placeholder="Partner name" 
              className="mb-2"
            />
            <Input 
              value={selectedPartner.twitter || ''} 
              onChange={(e) => dispatch({ type: 'UPDATE_PARTNER', payload: { ...selectedPartner, twitter: e.target.value } })} 
              placeholder="Twitter handle" 
              className="mb-2"
            />
            
            {/* Color Picker */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Partner Color</label>
              <div 
                className="w-10 h-10 cursor-pointer mb-1 rounded-md border border-gray-300" 
                style={{ backgroundColor: selectedPartner.color }} 
                onClick={() => dispatch({ type: 'TOGGLE_COLOR_PICKER' })}
              />
              {state.showColorPicker && (
                <SketchPicker 
                  color={selectedPartner.color} 
                  onChangeComplete={(color) => dispatch({ type: 'UPDATE_PARTNER', payload: { ...selectedPartner, color: color.hex } })} 
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
                onValueChange={(newValue) => dispatch({ type: 'UPDATE_PARTNER', payload: { ...selectedPartner, weight: newValue[0] } })}
              />
            </div>
          </div>
          
          {/* OpenAI API Key Input */}
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-bold mb-2">OpenAI API Key</h3>
            <Input 
              type="password"
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder="Enter your OpenAI API key"
              className="mb-2"
            />
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
                  disabled={isUploading || uploadedFiles.length === 0 || uploadedFiles.some(file => !file.content)}
                >
                  {isUploading ? 'Uploading...' : 'Upload Files'}
                </Button>
              </div>
            )}
          </div>
          
          {/* Partner Documents Section */}
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-bold mb-2">Partner Documents:</h3>
            {documents.length === 0 ? (
              <p className="text-gray-500">No documents uploaded yet.</p>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between mb-2 bg-white p-2 rounded-md">
                  <div className="flex items-center">
                    <File className="mr-2" size={16} />
                    <span className="truncate max-w-[150px]">{doc.filename}</span>
                  </div>
                  <div>
                    <Button onClick={() => handleDocumentView(doc.id)} variant="ghost" size="sm" className="mr-1">
                      <Eye size={16} />
                    </Button>
                    <Button onClick={() => handleDocumentDownload(doc.id, doc.filename)} variant="ghost" size="sm" className="mr-1">
                      <Download size={16} />
                    </Button>
                    <Button onClick={() => handleDeleteDocument(doc.id)} variant="destructive" size="sm">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Query Embedded Files Section */}
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-bold mb-2">Query Embedded Files</h3>
            <form onSubmit={handleQuerySubmit} className="mb-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your query"
                className="mb-2"
              />
              <Button type="submit" disabled={queryLoading || answerLoading}>
                {queryLoading || answerLoading ? 'Processing...' : 'Search'}
              </Button>
            </form>
            {queryError && <p className="text-red-500 mb-2">{queryError}</p>}
            {answer && (
              <div className="mt-4">
                <h4 className="font-semibold mb-1">Answer:</h4>
                <p className="text-sm bg-white p-2 rounded-md">{answer}</p>
              </div>
            )}
            {results.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-1">Relevant Files:</h4>
                <ul className="list-disc pl-5">
                  {results.map((result) => (
                    <li key={result.id} className="mb-2">
                      <p className="font-medium">{result.filename}</p>
                      <p className="text-sm text-gray-600">Distance: {result.distance.toFixed(4)}</p>
                      <div className="text-sm bg-gray-50 p-2 rounded-md mt-1">
                        <ReactMarkdown className="prose prose-sm">
                          {result.content}
                        </ReactMarkdown>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Partner Assumptions Section */}
          <PartnerAssumptions 
            partner={selectedPartner} 
            dispatch={dispatch} 
            onUpdate={handleAssumptionUpdate}
          />
          
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
      {embeddingError && (
        <Toast
          message={`Error getting embeddings: ${embeddingError}`}
          type="error"
          onClose={() => setEmbeddingError(null)}
        />
      )}
    </div>
  );
};