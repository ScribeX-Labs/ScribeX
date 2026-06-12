import { UploadDropzone } from '@/components/upload-dropzone';

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Upload</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
          What are we transcribing?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Audio or video — once it’s up, transcription starts automatically.
        </p>
      </div>
      <UploadDropzone />
    </div>
  );
}
