'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Download,
  Share,
  FileOutput,
  ArrowUp,
  X,
  ArrowLeft,
  Send,
  RotateCcw,
  FileAudio,
  FileVideo,
  Sparkles,
  ThumbsUp,
  FileText,
} from 'lucide-react';
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
import ScribeLogo from '@/components/ScribeLogo';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

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
  const [status, setStatus] = useState<'success' | 'processing' | 'failed'>('processing');
  const [text, setText] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [transcriptRating, setTranscriptRating] = useState(0);
  const [currentTextId, setCurrentTextId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'transcript' | 'chat'>('transcript');

  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const { getFileById, updateFile } = useUserUploadData();

  const [fileUrlLoaded, setFileUrlLoaded] = useState(false);
  const [transcriptionStatus, setTranscriptionStatus] = useState<TranscriptionStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null); // Ref for chat container
  const [processingPercentage, setProcessingPercentage] = useState(0);

  // Function to upload initial text
  const uploadText = async (text: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          file_id: fileData?.id,
          user_id: user?.uid,
          file_type: fileData?.content_type.split('/')[0],
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/update-media-url`, {
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

  // Simulate transcript processing progress
  useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        setProcessingPercentage((prev) => {
          // Cap at 95% until actually complete
          const newValue = prev + (1 + Math.random() * 2);
          return Math.min(newValue, 95);
        });
      }, 800);

      return () => clearInterval(interval);
    } else if (status === 'success') {
      setProcessingPercentage(100);
    }
  }, [status]);

  const checkTranscriptionStatus = async () => {
    if (!fileData?.id || !user?.uid) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transcription-status/${user.uid}/${fileData.id}`,
      );

      if (!response.ok) throw new Error('Failed to get transcription status');

      const statusData: TranscriptionStatus = await response.json();
      setTranscriptionStatus(statusData);

      if (statusData.status === 'COMPLETED') {
        setIsPolling(false);
        const transcriptResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/transcription/${user.uid}/${fileData.id}`,
        );

        if (transcriptResponse.ok) {
          const transcriptData = await transcriptResponse.json();
          setText(transcriptData.results.transcripts[0].transcript);
          setStatus('success');
        }
      } else if (statusData.status === 'FAILED') {
        setStatus('failed');
        setIsPolling(false);
      }
    } catch (error) {
      console.error('Error checking transcription status:', error);
      setStatus('failed');
      setIsPolling(false);
    }
  };

  // Initialize polling when component mounts
  useEffect(() => {
    const initializePolling = async () => {
      setIsLoading(true);
      const data = await getFileById(id);
      setFileData(data);
      setIsLoading(false);

      if (data?.id && user?.uid) {
        setIsPolling(true);
      }
    };

    initializePolling();
  }, [id, user?.uid]);

  // Handle polling
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (isPolling) {
      // Immediate check
      checkTranscriptionStatus();

      // Set up interval
      pollInterval = setInterval(checkTranscriptionStatus, 5000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isPolling, fileData?.id, user?.uid]);

  // Upload text when it changes
  useEffect(() => {
    if (text && !currentTextId) {
      uploadText(text);
    }
  }, [text, currentTextId]);

  // Load chat history when textId is available
  useEffect(() => {
    if (currentTextId) {
      loadChatHistory(currentTextId);
    }
  }, [currentTextId]);

  useEffect(() => {
    if (fileData && !fileUrlLoaded) {
      updateMediaURL(fileData.file_url).then((data) => {
        if (data) {
          fileData.file_url = data.new_file_url;
          setFileData(fileData);
          setFileUrlLoaded(true);
        }
      });
    }
  }, [fileData]);

  useEffect(() => {
    if (fileData?.text_id) {
      setCurrentTextId(fileData.text_id);
    }
  }, [fileData]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    setTranscriptRating(fileData?.rating || 0);
  }, [fileData]);

  // Function to send message to AI
  const sendMessageToAI = async (message: string): Promise<string> => {
    try {
      if (!fileData?.text_id) {
        throw new Error('No text ID available');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text_id: fileData.text_id,
          question: message,
          user_id: user?.uid,
          file_id: fileData.id,
          file_type: fileData.content_type.split('/')[0],
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/history/${textId}`);
      if (response.ok) {
        const data = await response.json();
        const formattedMessages: Message[] = [];
        for (let i = 0; i < data.questions.length; i++) {
          formattedMessages.push({ role: 'user', content: data.questions[i] });
          if (i < data.answers.length) {
            formattedMessages.push({ role: 'bot', content: data.answers[i] });
          }
        }
        setChatMessages(formattedMessages);
      }
      if (status !== 'success') {
        setStatus('success');
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      if (status !== 'success') {
        setStatus('failed');
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to chat
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    // Add loading message for bot
    setChatMessages((prev) => [...prev, { role: 'bot', content: '...' }]);

    // Get response from AI
    const botResponse = await sendMessageToAI(userMessage);

    // Update bot response
    setChatMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = { role: 'bot', content: botResponse };
      return newMessages;
    });
  };

  const handleAction = async (action: string) => {
    try {
      if (action === 'export') {
        // Logic for exporting transcript
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileData?.original_filename.split('.')[0] || 'transcript'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (action === 'rate') {
        setIsRatingOpen(true);
      }
    } catch (error) {
      console.error(`Error handling ${action}:`, error);
    }
  };

  const handleRate = (rating: number) => {
    setTranscriptRating(rating);
    setIsRatingOpen(false);

    if (fileData?.id) {
      updateFile(fileData.id, { rating });
    }
  };

  const getFileIcon = () => {
    const isAudio = fileData?.content_type.includes('audio');
    return isAudio ? <FileAudio className="h-5 w-5" /> : <FileVideo className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <div className="file-icon">{getFileIcon()}</div>
            <span className="max-w-md truncate">{fileData?.original_filename}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 rounded-full hover:bg-primary/5"
            onClick={() => handleAction('rate')}
          >
            <ThumbsUp className="h-4 w-4" />
            Rate
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-full hover:bg-primary/5"
            onClick={() => handleAction('export')}
          >
            <FileText className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -left-40 -top-20 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-[80px]"></div>
        <div className="absolute -bottom-40 -right-20 -z-10 h-80 w-80 rounded-full bg-secondary/10 blur-[80px]"></div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Video Player and Transcript */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Video/Audio Player */}
              <Card className="overflow-hidden border-2 shadow-lg">
                <div className="relative aspect-video w-full bg-black/90">
                  {fileData?.content_type.includes('video') ? (
                    <video src={fileData?.file_url} className="h-full w-full" controls></video>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
                      <div className="mb-4 rounded-full bg-primary/10 p-6">
                        <FileAudio className="h-12 w-12 text-primary" />
                      </div>
                      <audio src={fileData?.file_url} className="w-full max-w-md" controls></audio>
                    </div>
                  )}
                </div>
              </Card>

              {/* Transcript Card */}
              <Card className="gradient-border overflow-hidden border-2 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle>Transcript</CardTitle>
                    <CardDescription>
                      {status === 'processing'
                        ? 'Processing your media file...'
                        : status === 'failed'
                          ? 'Transcription failed'
                          : 'Transcription completed'}
                    </CardDescription>
                  </div>
                  {status === 'success' && (
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 px-3 py-1 text-xs font-medium text-primary">
                      <Sparkles className="h-3 w-3" /> AI Enhanced
                    </div>
                  )}
                </CardHeader>

                <CardContent>
                  {status === 'processing' && (
                    <div className="space-y-4 py-6">
                      <div className="flex animate-pulse flex-col items-center justify-center text-center">
                        <div className="rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 p-4">
                          <RotateCcw className="h-8 w-8 animate-spin text-primary" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium">Processing your transcript</h3>
                        <p className="text-sm text-muted-foreground">
                          This may take a few minutes depending on the length of your media
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Processing...</span>
                          <span>{Math.round(processingPercentage)}%</span>
                        </div>
                        <Progress
                          value={processingPercentage}
                          className="h-2 overflow-hidden bg-secondary/10"
                        >
                          <div className="h-full w-full bg-gradient-to-r from-primary to-secondary" />
                        </Progress>
                      </div>
                    </div>
                  )}

                  {status === 'failed' && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="rounded-full bg-destructive/10 p-4">
                        <X className="h-8 w-8 text-destructive" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium">Transcription Failed</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {transcriptionStatus?.failure_reason ||
                          "We couldn't process your file. Please try again or upload a different file."}
                      </p>
                      <Button className="button-glow mt-4 rounded-full" asChild>
                        <Link href="/dashboard/upload">Try Another File</Link>
                      </Button>
                    </div>
                  )}

                  {status === 'success' && (
                    <div className="max-h-[400px] overflow-y-auto rounded-md border bg-muted/40 p-4 shadow-inner">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Chat */}
          <div className="lg:col-span-2">
            <Card className="flex h-full flex-col overflow-hidden border-2 shadow-lg">
              <CardHeader className="flex-shrink-0 border-b bg-gradient-to-r from-primary/5 to-secondary/5 pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-1">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  AI Assistant
                </CardTitle>
                <CardDescription>
                  Ask questions about the transcript to get insights
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden p-0">
                <div
                  ref={chatContainerRef}
                  className="scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20 flex h-[500px] flex-col space-y-4 overflow-y-auto p-4"
                >
                  {chatMessages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                      <div className="glass-effect rounded-full p-4">
                        <Bot className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="gradient-text mt-4 text-xl font-medium">Ask me anything</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        I can help you analyze the transcript, answer questions, and provide
                        insights about your content.
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground'
                              : 'glass-effect'
                          }`}
                        >
                          {message.content === '...' ? (
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 animate-bounce rounded-full bg-current"></div>
                              <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:0.2s]"></div>
                              <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:0.4s]"></div>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex-shrink-0 border-t bg-gradient-to-r from-muted/50 to-background p-4">
                <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                  <Input
                    placeholder="Ask a question about the transcript..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 rounded-full border-primary/20 focus:border-primary/50 focus:ring-primary/20"
                    disabled={status !== 'success'}
                  />
                  <Button
                    type="submit"
                    className="button-glow rounded-full"
                    disabled={!inputMessage.trim() || status !== 'success'}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Rating Dialog */}
      <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
        <DialogContent className="glass-effect sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Transcript</DialogTitle>
            <DialogDescription>
              How would you rate the quality of this transcript?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <StarRating maxRating={5} rating={transcriptRating} onChange={handleRate} size={32} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Page;
