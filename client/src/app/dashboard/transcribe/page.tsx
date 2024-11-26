'use client'

import { useState } from 'react'
import { Bot, Download, Share, FileOutput } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusInfoDialog } from "@/components/status-info-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { StarRating } from "@/components/star-rating"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function Home() {
  const [status, setStatus] = useState<'success' | 'processing' | 'failed'>('success')
  const [text, setText] = useState<string>('')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'bot', content: string }>>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isRatingOpen, setIsRatingOpen] = useState(false)
  const [transcriptRating, setTranscriptRating] = useState(0)

  const handleAction = (action: string) => {
    // Simulate processing without changing the status
    console.log(`${action} action triggered`)
  }

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      setChatMessages([...chatMessages, { role: 'user', content: inputMessage }])
      setInputMessage('')
      // Simulate bot response
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'bot', content: 'This is a simulated response.' }])
      }, 1000)
    }
  }

  const handleRate = (rating: number) => {
    setTranscriptRating(rating)
    // Here you would typically send the rating to your backend
    console.log(`Transcript rated: ${rating} stars`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-5xl space-y-4">
        <div className="flex justify-between items-center">
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
            <Button onClick={() => handleAction('Export with captions')} aria-label="Export with captions">
              <FileOutput className="mr-2 h-4 w-4" />
              Export w/ captions
            </Button>
          </div>
          <ThemeToggle />
        </div>
        <textarea
          className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-background text-foreground"
          value={text}
          readOnly
          placeholder="Text will appear here..."
          aria-label="Content display area"
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
          <div className="mb-4 w-80 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
            <div className="bg-primary text-primary-foreground p-3 font-bold">Chat with AI</div>
            <div className="h-64 overflow-y-auto p-4 space-y-2">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-primary/10' : 'bg-muted'}`}>
                    {msg.content}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex">
              <Input
                type="text"
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-grow mr-2"
              />
              <Button type="submit" size="sm">
                <Bot className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
        <Button onClick={toggleChat} variant="outline" size="icon" aria-label="Toggle chat">
          <Bot className="h-6 w-6 text-primary" />
        </Button>
      </div>
    </main>
  )
}

