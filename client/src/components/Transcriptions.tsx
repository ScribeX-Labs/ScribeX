// components/Transcriptions.tsx
import { FC } from "react"
import { FileAudio, FileVideo } from "lucide-react"

const Transcriptions: FC = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      <FileAudio className="text-blue-500" />
      <div>
        <p className="font-medium">Lecture on Data Structures</p>
        <p className="text-sm text-gray-500">Transcribed on May 15, 2023</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <FileVideo className="text-green-500" />
      <div>
        <p className="font-medium">Algorithm Analysis Tutorial</p>
        <p className="text-sm text-gray-500">Transcribed on May 10, 2023</p>
      </div>
    </div>
  </div>
)

export default Transcriptions
