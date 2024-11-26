'use client'

import { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type StatusType = 'success' | 'processing' | 'failed'

const statusConfig = {
  success: { color: 'bg-green-500', text: 'Transcription successful' },
  processing: { color: 'bg-yellow-500', text: 'Transcription needs to be processed' },
  failed: { color: 'bg-red-500', text: 'Transcription failed' },
}

export function StatusIcon({ status }: { status: StatusType }) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  return (
    <TooltipProvider>
      <Tooltip open={isTooltipOpen}>
        <TooltipTrigger asChild>
          <button
            className={`w-4 h-4 rounded-full ${statusConfig[status].color}`}
            onClick={() => setIsTooltipOpen(!isTooltipOpen)}
            onMouseEnter={() => setIsTooltipOpen(true)}
            onMouseLeave={() => setIsTooltipOpen(false)}
            aria-label={`Status: ${statusConfig[status].text}`}
          />
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={5}>
          <p>{statusConfig[status].text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

