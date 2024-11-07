'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileAudio, FileVideo, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function FileUploadDropzoneComponent() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setUploadError(null)
      setUploadSuccess(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': [],
      'video/*': [],
    },
    maxFiles: 1,
    multiple: false,
  })

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)
    setUploadError(null)
    setUploadSuccess(false)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setUploadSuccess(true)
        console.log('File uploaded successfully:', result.url)
      } else {
        setUploadError(result.error || 'An error occurred during upload')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setUploadError('An error occurred during upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Upload Audio/Video File</h1>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-lg">Drop the audio or video file here</p>
          ) : (
            <p className="text-lg">Drag &apos;n&apos; drop an audio or video file here, or click to select</p>
          )}
          <p className="text-sm text-gray-500 mt-2">Max file size: 500 MB, Max duration: 2 minutes</p>
        </div>
      </div>
      {file && (
        <div className="mt-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {file.type.startsWith('audio/') ? (
              <FileAudio className="w-4 h-4" />
            ) : (
              <FileVideo className="w-4 h-4" />
            )}
            <span>{file.name}</span>
            <span>({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
          </div>
          <Button onClick={handleUpload} disabled={uploading} className="w-full mt-4">
            {uploading ? 'Uploading...' : 'Upload'}
            <Upload className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
      {uploading && (
        <div className="mt-4">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-gray-600 mt-2">{uploadProgress}% uploaded</p>
        </div>
      )}
      {uploadError && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded flex items-center">
          <AlertCircle className="mr-2 h-4 w-4" />
          {uploadError}
        </div>
      )}
      {uploadSuccess && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded flex items-center">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          File uploaded successfully!
        </div>
      )}
    </div>
  )
}