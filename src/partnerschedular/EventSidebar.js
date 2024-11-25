// EventSidebar.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { TemplateManager } from './TemplateManager';
import { AppContext } from './index';
import { useEventData } from './hooks/useEventData';
import { ContentIdeas } from './ContentIdeas';
import { TwitterTimeline } from './twitterTimeline';
import { useContentGenerator } from './hooks/useContentGenerator';
import ReactMarkdown from 'react-markdown';
import { PartnerAssumptions } from './PartnerAssumptions';
import { useTypefullyDrafts } from '../hooks/useTypefullyDrafts';
import { usePartnerTweets } from '../hooks/usePartnerTweets';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useOpenAI } from '../hooks/useOpenAI';
import { Textarea } from '../components/ui/textarea';

const EventDetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

export const EventSidebar = () => {
  const { state, dispatch } = useContext(AppContext);
  const { selectedEvent } = state;

  if (!state.eventSidebarOpen) return null;

  const handleClose = () => {
    dispatch({ type: 'CLOSE_EVENT_SIDEBAR' });
  };

  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [contentSize, setContentSize] = useState(selectedEvent.contentType === 'Tweet' ? 100 : 500);
  
  const [actualAdditionalContext, setActualAdditionalContext] = useState('');

  const { isApproved, setIsApproved } = useEventData(selectedEvent);
  const { generateContent, isLoading } = useContentGenerator();
  const { addDraft, isLoading: isTypefullyLoading, error: typefullyError } = useTypefullyDrafts();

  const { tweets, loading: tweetsLoading, error: tweetsError } = usePartnerTweets(selectedEvent.partner.id, 100);

  const additionalContext =  tweets.map(tweet => `
    Tweet ID: ${tweet.id}
    Date: ${tweet.created_at}
    Content: ${tweet.text}
    `).join('\n')

  const handleOpenTemplateManager = () => setIsTemplateManagerOpen(true);
  const handleCloseTemplateManager = () => setIsTemplateManagerOpen(false);
  
  const handleApproveContent = async () => {
    const editor = editorRef.current.getEditor();
    const plainText = editor.getText(); // Retrieves plain text without formatting
    if (plainText) {
      const result = await addDraft({
        content: plainText,
        threadify: false,
        share: false,
        scheduleDate: selectedEvent.date,
        autoRetweetEnabled: false,
        autoPlugEnabled: false,
      });
      console.log("🧙‍♂️ 🔎 -> ~ handleApproveContent ~ result:", result)
      if (result) {
        dispatch({ type: 'APPROVE_EVENT_CONTENT', payload: { id: selectedEvent.id } });
        setIsApproved(true);
        // You can add a success notification here
      } else {
        // Handle error, maybe show an error notification
        console.error('Failed to add draft to Typefully:', typefullyError);
      }
    }
  };

  const contentSizeOptions = [
    { label: 'Micro', value: 50 },
    { label: 'Tiny', value: 100 },
    { label: 'Small', value: 200 },
    { label: 'Twitter', value: 100 },
    { label: 'Medium', value: 500 },
    { label: 'Large', value: 800 },
    { label: 'XL', value: 1200 },
    { label: 'XXL', value: 2000 },
    { label: 'Essay', value: 3000 },
    { label: 'Article', value: 5000 },
    { label: 'Long-form', value: 8000 }
  ];

  const handleSelectIdea = async (idea) => {
    try {
      const content = await generateContent(selectedEvent, idea.template, contentSize, additionalContext, actualAdditionalContext, idea);
      dispatch({
        type: 'UPDATE_EVENT_CONTENT',
        payload: {
          id: selectedEvent.id,
          content,
          isApproved: false,
          selectedIdea: idea
        }
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate content. Please try again.' });
    }
  };

  const handleGenerateContent = async () => {
    try {
      const content = await generateContent(selectedEvent, selectedTemplate, contentSize, additionalContext, actualAdditionalContext);
      dispatch({
        type: 'UPDATE_EVENT_CONTENT',
        payload: {
          id: selectedEvent.id,
          content,
          isApproved: false
        }
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate content. Please try again.' });
    }
  };

  let currentEvent;
  try {
    currentEvent = state.schedule.find(e => e.id === selectedEvent.id) || selectedEvent;
  } catch (error) {
    debugger;
    console.error('Error finding current event:', error);
  }

  const handleEditPartner = () => {
    dispatch({ type: 'OPEN_PARTNER_SIDEBAR', payload: selectedEvent.partner });
  };

  
  const handleGeneratedContentEdit = (content) => {
    const editor = editorRef.current?.getEditor();
    const plainText = editor?.getText(); // Retrieves plain text without formatting
    if (plainText && plainText !== currentEvent.generatedContent) {
      dispatch({
        type: 'UPDATE_EVENT_GENERATED_CONTENT',
        payload: {
          id: selectedEvent.id,
          content: plainText,
          lastEditedAt: new Date().toISOString()
        }
      });
    }
  };

  // Quill editor modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  const [refinementComments, setRefinementComments] = useState('');
  const apiKey = localStorage.getItem('chatgptApiKey');
  const { getCompletion, loading: isRefining } = useOpenAI(apiKey);

  const handleRefineContent = async () => {
    if (currentEvent.generatedContent && refinementComments) {
      const prompt = `Please refine the following content based on these comments: "${refinementComments}"\n\nOriginal content:\n${currentEvent.generatedContent}`;
      
      try {
        const refinedContent = await getCompletion(prompt);
        if (refinedContent) {
          dispatch({
            type: 'UPDATE_EVENT_GENERATED_CONTENT',
            payload: { id: selectedEvent.id, content: refinedContent }
          });
          setRefinementComments('');
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to refine content. Please try again.' });
      }
    }
  };

  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleAdvancedMode = () => {
    setShowAdvanced(!showAdvanced);
  };

  const editorRef = useRef(null);

  return (
    <div className="fixed top-0 left-0 z-50 w-2/3 h-full bg-white shadow-lg">
      <Card className="h-full overflow-auto">
        <CardHeader className="flex flex-row justify-between space-x-4">
          <CardTitle>Event Details</CardTitle>
          <div className="flex flex-row space-x-4">
          <Button onClick={handleEditPartner} className="">Edit Partner</Button>
          <Button onClick={handleClose} className="">Close</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-6 mb-4 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="mb-1 text-2xl font-bold">{selectedEvent.partner.name}</h2>
                {selectedEvent.partner.twitter && (
                  <a
                    href={`https://twitter.com/${selectedEvent.partner.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    @{selectedEvent.partner.twitter}
                  </a>
                )}
              </div>
              <div className="flex space-x-6">
                <EventDetailItem label="Content Type" value={selectedEvent.contentType} />
                <div className="mx-2 border-r border-gray-300"></div>
                <EventDetailItem label="Time Slot" value={selectedEvent.timeSlot} />
                <div className="mx-2 border-r border-gray-300"></div>
                <EventDetailItem label="Date" value={new Date(selectedEvent.date).toDateString()} />
              </div>
            </div>
            <div className="flex flex-row space-x-4">
                
              <div className="w-1/2">
                <PartnerAssumptions partner={selectedEvent.partner} dispatch={dispatch} />
              </div>
              <div className="w-1/2">
                {tweetsLoading ? (
                  <p>Loading tweets...</p>
                ) : tweetsError ? (
                  <p>Error loading tweets: {tweetsError}</p>
                ) : (
                  <div className="overflow-y-auto max-h-[250px]">
                    <h3><b>Latest Stored Tweets</b></h3>
                    {tweets.map((tweet) => (
                      <div key={tweet.id} className="p-2 mb-2 border rounded">
                        <p>{tweet.text}</p>
                        <small>{new Date(tweet.created_at).toLocaleString()}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <ContentIdeas
            event={selectedEvent}
            selectedTemplate={selectedTemplate}
            additionalContext={additionalContext}
            actualAdditionalContext={actualAdditionalContext}
            onSelectIdea={handleSelectIdea}
          />

          <div className="flex justify-end mt-4 mb-2">
            <Button
              onClick={toggleAdvancedMode}
              variant="outline"
              size="sm"
              className={`${showAdvanced ? 'bg-blue-100' : ''}`}
            >
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </Button>
          </div>

          <div className="flex flex-row space-x-4 mt-4">
            {showAdvanced && (
              <>
              <div className="w-1/2">
                <h3 className="text-lg font-bold mb-2">Additional Context</h3>
                <ReactQuill
                  theme="snow"
                  value={actualAdditionalContext}
                  onChange={setActualAdditionalContext}
                  modules={modules}
                  formats={formats}
                  className="h-64 mb-4"
                />
              </div>
              <div className={`flex flex-col w-full space-y-4`}>
              <select
                value={selectedTemplate?.title || ''}
                onChange={(e) => setSelectedTemplate(state.templates.find(template => template.title === e.target.value))}
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>Select a template</option>
                {state.templates && state.templates.map((template, index) => (
                  <option key={index} value={template.title}>{template.title}</option>
                ))}
              </select>

              <select
                value={contentSize}
                onChange={(e) => setContentSize(parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              >
                {contentSizeOptions.map((option) => (
                  <option key={option.label} value={option.value}>{option.label}</option>
                ))}
              </select>

              <Button
                onClick={handleGenerateContent}
                className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Generating Content...' : 'Generate Content'}
              </Button>

              <Button
                onClick={handleApproveContent}
                className="w-full px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700"
                disabled={isApproved || !currentEvent.generatedContent || isTypefullyLoading}
              >
                {isTypefullyLoading ? 'Adding to Typefully...' : (isApproved ? 'Approved' : 'Approve Content')}
              </Button>

              <Button 
                onClick={handleOpenTemplateManager} 
                className="w-full px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700"
              >
                Manage Templates
              </Button>
            </div>
              </>
            )}
            
          </div>
          {currentEvent.generatedContent && (
            <div className="p-2 mt-4">
              <h3 className="text-lg font-bold">Generated Content</h3>
              {currentEvent.selectedIdea && (
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold">{currentEvent.selectedIdea.title}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <EventDetailItem label="Template" value={currentEvent.selectedIdea.template} />
                    <EventDetailItem label="Topic" value={currentEvent.selectedIdea.topic} />
                  </div>
                  <div>
                      <p className="text-sm text-gray-600">Brief</p>
                      <p className="text-sm">{currentEvent.selectedIdea.brief}</p>
                    </div>
                </div>
              )}
              <div className="flex space-x-4">
                <div className="w-1/3">
                  <Textarea
                    placeholder="Enter refinement comments..."
                    value={refinementComments}
                    onChange={(e) => setRefinementComments(e.target.value)}
                    className="mb-2 h-32"
                  />
                  <Button
                    onClick={handleRefineContent}
                    className="w-full px-4 py-2 font-bold text-white bg-purple-500 rounded hover:bg-purple-700"
                    disabled={isRefining || !refinementComments}
                  >
                    {isRefining ? 'Refining...' : 'Refine Content'}
                  </Button>
                </div>
                <div className="w-2/3">
                  <ReactQuill
                    theme="snow"
                    value={currentEvent.generatedContent}
                    onChange={handleGeneratedContentEdit}
                    modules={modules}
                    formats={formats}
                    className="h-64 mb-4"
                    ref={editorRef}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {isTemplateManagerOpen && (
        <TemplateManager onClose={handleCloseTemplateManager} />
      )}
    </div>
  );
};