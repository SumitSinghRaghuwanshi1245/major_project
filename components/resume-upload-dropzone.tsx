'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function ResumeUploadDropzone({ onSuccess }: { onSuccess?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload and parse resume');
      }

      setSuccess(true);
      
      // Wait a moment to show success state before refreshing
      setTimeout(() => {
        router.refresh();
        if (onSuccess) onSuccess();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-green-500/50 bg-green-500/10 rounded-xl text-green-400">
        <CheckCircle className="w-12 h-12 mb-4" />
        <h3 className="text-lg font-semibold">Resume Parsed Successfully!</h3>
        <p className="text-sm mt-2 text-green-400/80">Updating your profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
          isDragActive 
            ? "border-indigo-500 bg-indigo-500/10" 
            : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30",
          file && "border-indigo-500/50 bg-indigo-500/5"
        )}
      >
        <input {...getInputProps()} />
        
        {file ? (
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-indigo-500/20 rounded-full mb-4">
              <FileText className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-sm font-medium text-white mb-1">{file.name}</p>
            <p className="text-xs text-white/50 mb-4">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              className="mt-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              disabled={isUploading}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-white/5 rounded-full mb-4">
              <UploadCloud className="w-8 h-8 text-white/60" />
            </div>
            <p className="text-sm font-medium text-white mb-1">
              {isDragActive ? "Drop your resume here" : "Click or drag resume to upload"}
            </p>
            <p className="text-xs text-white/50">
              Supports PDF, DOC, DOCX (Max 10MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
          {error}
        </div>
      )}

      {file && (
        <Button 
          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white" 
          onClick={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Parsing Resume with AI...
            </>
          ) : (
            'Upload & Parse Resume'
          )}
        </Button>
      )}
    </div>
  );
}
