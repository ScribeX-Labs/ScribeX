// components/UploadContent.tsx
import { FC } from "react"
import { Upload } from "lucide-react"

const UploadContent: FC = () => (
  <div className="flex items-center justify-center w-full">
    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50">
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <Upload className="w-8 h-8 mb-4 text-gray-500" />
        <p className="mb-2 text-sm text-gray-500">
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500">MP3, MP4, WAV (MAX. 1GB)</p>
      </div>
      <input id="dropzone-file" type="file" className="hidden" />
    </label>
  </div>
)

export default UploadContent
