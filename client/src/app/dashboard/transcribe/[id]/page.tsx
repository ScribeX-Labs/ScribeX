'use client';

import { useState, useEffect } from 'react';
import { Bot, Download, Share, FileOutput } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusInfoDialog } from '@/components/status-info-dialog';
import { StarRating } from '@/components/star-rating';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { FileData, useUserUploadData } from '@/context/UserUploadDataContext';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

interface ChatResponse {
  answer: string;
  text_id: string;
}

interface TranscriptionStatus {
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  transcript_uri?: string;
  failure_reason?: string;
}

function Page({ params: { id } }: { params: { id: string } }) {
  const [status, setStatus] = useState<'success' | 'processing' | 'failed'>('success');
  const [text, setText] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [transcriptRating, setTranscriptRating] = useState(0);
  const [currentTextId, setCurrentTextId] = useState<string | null>(null);

  const [fileData, setFileData] = useState<FileData | null>(null);

  const { user } = useAuth();
  const { getFileById } = useUserUploadData();

  const [fileUrlLoaded, setFileUrlLoaded] = useState(false);
  const [transcriptionStatus, setTranscriptionStatus] = useState<TranscriptionStatus | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // You should get this from your auth context/provider
  // Function to upload initial text
  const uploadText = async (text: string) => {
    try {
      const response = await fetch('http://localhost:8000/ai/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          user_id: user?.uid,
        }),
      });

      if (!response.ok) throw new Error('Failed to upload text');

      const data = await response.json();
      setCurrentTextId(data.text_id);
      return data.text_id;
    } catch (error) {
      console.error('Error uploading text:', error);
      setStatus('failed');
      return null;
    }
  };

  const updateMediaURL = async (file_url: string) => {
    try {
      const response = await fetch(`http://localhost:8000/update-media-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.uid,
          file_url: file_url,
        }),
      });

      if (!response.ok) throw new Error('Failed to update media URL');

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating media URL:', error);
    }
  };

  const checkTranscriptionStatus = async () => {
    if (!fileData?.id || !user?.uid) return;

    try {
      const response = await fetch(
        `http://localhost:8000/transcription-status/${user.uid}/${fileData.id}`,
      );

      if (!response.ok) throw new Error('Failed to get transcription status');

      const statusData = await response.json();
      setTranscriptionStatus(statusData);

      if (statusData.status === 'COMPLETED') {
        // Fetch the transcription
        const transcriptResponse = await fetch(
          `http://localhost:8000/transcription/${user.uid}/${fileData.id}`,
        );

        if (transcriptResponse.ok) {
          const transcriptData = await transcriptResponse.json();
          // Assuming the transcription is in the results.transcripts[0].transcript field
          setText(transcriptData.results.transcripts[0].transcript);
          setStatus('success');
          // Clear the polling interval
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
      } else if (statusData.status === 'FAILED') {
        setStatus('failed');
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
    } catch (error) {
      console.error('Error checking transcription status:', error);
      setStatus('failed');
    }
  };

  useEffect(() => {
    if (fileData?.id && user?.uid && !pollingInterval) {
      // Initial check
      checkTranscriptionStatus();

      // Set up polling every 5 seconds
      const interval = setInterval(checkTranscriptionStatus, 5000);
      setPollingInterval(interval);

      // Cleanup on unmount
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [fileData?.id, user?.uid]);

  // Upload text when it changes
  useEffect(() => {
    getFileById(id).then((data) => setFileData(data));
    if (text && !currentTextId) {
      uploadText(text);
    }
  }, [text]);

  // Load chat history when textId is available
  useEffect(() => {
    if (currentTextId) {
      loadChatHistory(currentTextId);
    }
  }, [currentTextId]);

  useEffect(() => {
    if (fileData) {
      updateMediaURL(fileData.file_url).then((data) => {
        fileData.file_url = data.new_file_url;
        setFileData(fileData);
        setFileUrlLoaded(true);
      });
    }
  }, [fileData]);

  // Function to send message to AI
  const sendMessageToAI = async (message: string): Promise<string> => {
    try {
      if (!currentTextId) {
        throw new Error('No text ID available');
      }

      const response = await fetch('http://localhost:8000/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text_id: currentTextId,
          question: message,
          user_id: user?.uid,
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data: ChatResponse = await response.json();
      return data.answer;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return 'Sorry, I encountered an error processing your request.';
    }
  };

  const loadChatHistory = async (textId: string) => {
    try {
      setStatus('processing');
      const response = await fetch(
        `http://localhost:8000/ai/conversation/${textId}?user_id=${user?.uid}`,
      );

      if (!response.ok) throw new Error('Failed to load chat history');

      const data = await response.json();

      // Convert the conversation history format to match our Message interface
      const formattedMessages: Message[] = data.conversation.flatMap((entry: any) => [
        { role: 'user', content: entry.question },
        { role: 'bot', content: entry.answer },
      ]);

      setChatMessages(formattedMessages);
      setText(data.text);
      setStatus('success');
    } catch (error) {
      console.error('Error loading chat history:', error);
      setStatus('failed');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      setChatMessages((prev) => [...prev, { role: 'user', content: inputMessage }]);
      setInputMessage('');
      setStatus('processing');

      const aiResponse = await sendMessageToAI(inputMessage);

      setChatMessages((prev) => [...prev, { role: 'bot', content: aiResponse }]);
      setStatus('success');
    }
  };

  const handleAction = async (action: string) => {
    if (action === 'Share' && currentTextId) {
      try {
        const response = await fetch(
          `http://localhost:8000/ai/conversation/${currentTextId}?user_id=${user?.uid}`,
        );
        if (!response.ok) throw new Error('Failed to get conversation history');

        const data = await response.json();
        console.log('Conversation history:', data);

        // Create shareable URL
        const shareUrl = new URL(window.location.href);
        shareUrl.searchParams.set('textId', currentTextId);

        // Use native share if available, fallback to clipboard
        if (navigator.share) {
          await navigator.share({
            title: 'Shared Conversation',
            url: shareUrl.toString(),
          });
        } else {
          await navigator.clipboard.writeText(shareUrl.toString());
          // You might want to add a toast notification here
          alert('Link copied to clipboard!');
        }
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleRate = (rating: number) => {
    setTranscriptRating(rating);
    // Here you could send the rating to your backend
    console.log(`Transcript rated: ${rating} stars`);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl space-y-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {fileData?.original_filename || 'Transcription'} - {fileData?.content_type}
          </h1>
        </div>
      </div>
      <div>
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <StatusInfoDialog
                status={
                  transcriptionStatus?.status === 'IN_PROGRESS'
                    ? 'processing'
                    : transcriptionStatus?.status === 'COMPLETED'
                      ? 'success'
                      : 'failed'
                }
              />
              <span className="ml-2">
                Status:
                {transcriptionStatus?.status === 'IN_PROGRESS'
                  ? ' In Progress'
                  : transcriptionStatus?.status === 'COMPLETED'
                    ? ' Completed'
                    : ' Failed'}
              </span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Rate Transcript</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Rate the Transcript</DialogTitle>
                  <DialogDescription>
                    How would you rate the quality of this transcript?
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <StarRating onRate={handleRate} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {transcriptRating > 0 && (
            <div className="text-sm text-muted-foreground">
              You rated this transcript: {transcriptRating} stars
            </div>
          )}
        </div>
        {fileUrlLoaded ? (
          <div className="mb-4 w-full max-w-5xl space-y-4">
            {fileData?.content_type.startsWith('video') ? (
              <video controls className="w-full rounded-lg">
                <source src={fileData.file_url} type={fileData.content_type} />
                Your browser does not support the video tag.
              </video>
            ) : fileData?.content_type.startsWith('audio') ? (
              <audio controls className="w-full rounded-lg">
                <source src={fileData.file_url} type={fileData.content_type} />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <p>Unsupported file type</p>
            )}
          </div>
        ) : (
          <p>Loading...</p>
        )}
        <div className="w-full max-w-5xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button onClick={() => handleAction('Download')} aria-label="Download">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button onClick={() => handleAction('Export')} aria-label="Export">
                <FileOutput className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => handleAction('Share')} aria-label="Share">
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button
                onClick={() => handleAction('Export with captions')}
                aria-label="Export with captions"
              >
                <FileOutput className="mr-2 h-4 w-4" />
                Export w/ captions
              </Button>
            </div>
          </div>

          <textarea
            className="h-96 w-full rounded-lg border border-gray-300 bg-background p-4 text-foreground focus:border-transparent focus:ring-2 focus:ring-blue-500"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here..."
            aria-label="Content input area"
          />
        </div>
      </div>
      <div className="fixed bottom-5 right-5 flex flex-col items-end">
        {isChatOpen && (
          <div className="mb-4 w-80 overflow-hidden rounded-lg border border-border bg-background shadow-lg">
            <div className="bg-primary p-3 font-bold text-primary-foreground">Chat with AI</div>
            <div className="h-64 space-y-2 overflow-y-auto p-4">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <span
                    className={`inline-block rounded-lg p-2 ${msg.role === 'user' ? 'bg-primary/10' : 'bg-muted'}`}
                  >
                    {msg.content}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex border-t border-border p-4">
              <Input
                type="text"
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="mr-2 flex-grow"
              />
              <Button type="submit" size="sm" disabled={status === 'processing'}>
                <Bot className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
        <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          variant="outline"
          size="icon"
          aria-label="Toggle chat"
        >
          <Bot className="h-6 w-6 text-primary" />
        </Button>
      </div>
    </div>
  );
}

export default Page;
