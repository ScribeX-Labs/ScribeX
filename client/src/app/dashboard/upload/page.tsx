import { FileUploadDropzoneComponent } from '@/components/file-upload-dropzone';
import Link from 'next/link';
import React from 'react';

function Page() {
  return (
    <div className="flex w-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl space-y-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Upload Audio/Video File</h1>
        </div>
        <FileUploadDropzoneComponent />
      </div>
    </div>
  );
}

export default Page;
