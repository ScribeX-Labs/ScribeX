'use client';

import { useState, useEffect } from 'react';
import { Bot, Download, Share, FileOutput } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusInfoDialog } from '@/components/status-info-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
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

interface Message {
  role: 'user' | 'bot';
  content: string;
}

interface ChatResponse {
  answer: string;
  text_id: string;
}

export default function Transcribe() {
  const [status, setStatus] = useState<'success' | 'processing' | 'failed'>('success');
  const [text, setText] = useState<string>(
    'Heading into the school year as an educator is stressful enough. If you are worried about what to do about students using popular and increasingly powerful AI tools like ChatGPT for their academic assignments, we’re here to help navigate the big questions: What should I be doing about AI? How do I teach critical thinking and learning in the era of AI homework helpers?\n\nWe’ve collected practical guidance from top educational sources and our own research on teaching responsibly with AI content detection. This guide includes material for educators in both K-12 and higher education, to help you decide how to approach teaching and evaluating AI use in your classroom.',
  );
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [transcriptRating, setTranscriptRating] = useState(0);
  const [currentTextId, setCurrentTextId] = useState<string | null>(null);

  const { user } = useAuth();

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

  // Upload text when it changes
  useEffect(() => {
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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
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
          <ThemeToggle />
        </div>
        <textarea
          className="h-96 w-full resize-none rounded-lg border border-gray-300 bg-background p-4 text-foreground focus:border-transparent focus:ring-2 focus:ring-blue-500"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here..."
          aria-label="Content input area"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <StatusInfoDialog status={status} />
            <span className="ml-2">Status: {status.charAt(0).toUpperCase() + status.slice(1)}</span>
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
    </main>
  );
}
