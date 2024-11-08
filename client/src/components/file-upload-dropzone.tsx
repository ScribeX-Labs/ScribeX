'use client'
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio, FileVideo, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';

export function FileUploadDropzoneComponent() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setUploadError(null);
      setUploadSuccess(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': [],
      'video/*': [],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);

    // Use FormData to handle the file upload
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Append user_id as a query parameter
      const response = await fetch(`http://localhost:8000/upload-media/?user_id=${user.uid}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadSuccess(true);
        console.log('File uploaded successfully:', result.file_url);
      } else {
        const errorResult = await response.json();
        setUploadError(
          typeof errorResult.detail === 'string'
            ? errorResult.detail
            : 'An error occurred during upload',
        );
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md rounded-lg bg-white p-6 shadow-md">
      <h1 className="mb-4 text-2xl font-bold">Upload Audio/Video File</h1>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <Upload className="mb-4 h-12 w-12 text-gray-400" />
          {isDragActive ? (
            <p className="text-lg">Drop the audio or video file here</p>
          ) : (
            <p className="text-lg">
              Drag &apos;n&apos; drop an audio or video file here, or click to select
            </p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Max file size: 500 MB, Max duration: 2 minutes
          </p>
        </div>
      </div>
      {file && (
        <div className="mt-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {file.type.startsWith('audio/') ? (
              <FileAudio className="h-4 w-4" />
            ) : (
              <FileVideo className="h-4 w-4" />
            )}
            <span>{file.name}</span>
            <span>({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
          </div>
          <Button onClick={handleUpload} disabled={uploading} className="mt-4 w-full">
            {uploading ? 'Uploading...' : 'Upload'}
            <Upload className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
      {uploading && (
        <div className="mt-4">
          <Progress value={uploadProgress} className="w-full" />
          <p className="mt-2 text-sm text-gray-600">{uploadProgress}% uploaded</p>
        </div>
      )}
      {uploadError && (
        <div className="mt-4 flex items-center rounded bg-red-100 p-2 text-red-700">
          <AlertCircle className="mr-2 h-4 w-4" />
          {uploadError}
        </div>
      )}
      {uploadSuccess && (
        <div className="mt-4 flex items-center rounded bg-green-100 p-2 text-green-700">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          File uploaded successfully!
        </div>
      )}
    </div>
  );
}
