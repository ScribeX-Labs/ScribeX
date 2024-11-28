import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type StatusType = 'success' | 'processing' | 'failed'

const statusConfig = {
  success: { color: 'bg-green-500', text: 'Transcription successful' },
  processing: { color: 'bg-yellow-500', text: 'Transcription needs to be processed' },
  failed: { color: 'bg-red-500', text: 'Transcription failed' },
}

export function StatusInfoDialog({ status }: { status: StatusType }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className={`w-4 h-4 rounded-full ${statusConfig[status].color}`}
          onClick={() => setIsOpen(true)}
          aria-label="Show status information"
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Status Information</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {(Object.keys(statusConfig) as StatusType[]).map((key) => (
            <div key={key} className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${statusConfig[key].color}`} />
              <p>{statusConfig[key].text}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

