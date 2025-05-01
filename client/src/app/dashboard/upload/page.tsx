import { FileUploadDropzoneComponent } from '@/components/file-upload-dropzone';
import Link from 'next/link';
import React from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Page() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Upload Media</h1>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -left-20 -top-10 -z-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 -z-10 h-60 w-60 rounded-full bg-secondary/10 blur-3xl"></div>
        <div className="mx-auto max-w-2xl">
          <FileUploadDropzoneComponent />
        </div>
      </div>
    </div>
  );
}

export default Page;
