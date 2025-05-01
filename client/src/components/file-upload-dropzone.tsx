'use client'
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileAudio,
  FileVideo,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function FileUploadDropzoneComponent() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const router = useRouter();

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

  // Simulated progress updates
  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        const newProgress = prevProgress + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 300);
    return interval;
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);

    // Start progress simulation
    const progressInterval = simulateProgress();

    // Use FormData to handle the file upload
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Append user_id as a query parameter
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload-media/?user_id=${user.uid}`,
        {
          method: 'POST',
          body: formData,
        },
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        setUploadSuccess(true);
        // Add a small delay before redirecting for better UX
        setTimeout(() => {
          router.push(`/dashboard/transcribe/${result.id}`);
        }, 1000);
      } else {
        const errorResult = await response.json();
        setUploadError(
          typeof errorResult.detail === 'string'
            ? errorResult.detail
            : 'An error occurred during upload',
        );
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Error uploading file:', error);
      setUploadError('An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  const getIconForFile = (file: File) => {
    if (file.type.startsWith('audio/')) {
      return <FileAudio className="h-5 w-5 text-primary" />;
    } else {
      return <FileVideo className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card className="overflow-hidden border-2">
      <CardHeader>
        <CardTitle>Upload Media File</CardTitle>
        <CardDescription>Drag and drop your audio or video file to transcribe</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed p-8 text-center transition-all ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-primary/5'
          }`}
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl"></div>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <UploadCloud className="h-8 w-8 text-primary" />
            </div>
            {isDragActive ? (
              <p className="text-lg font-medium">Drop the file here</p>
            ) : (
              <p className="text-lg font-medium">Drag &amp; drop or click to select</p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              Supports audio and video files up to 500MB
            </p>
          </div>
        </div>

        {file && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border bg-card/50 p-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">{getIconForFile(file)}</div>
                <div className="flex-grow overflow-hidden">
                  <p className="truncate font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB · {file.type}
                  </p>
                </div>
              </div>
            </div>

            {!uploadSuccess && (
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="button-glow w-full rounded-full"
              >
                {uploading ? (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload and Transcribe
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {uploading && (
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2 w-full" />
          </div>
        )}

        {uploadError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p>{uploadError}</p>
          </div>
        )}

        {uploadSuccess && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-100 p-3 text-sm text-green-700 dark:bg-green-700/20 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            <p>File uploaded successfully! Redirecting to transcription...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
