'use client';

import { useState, useEffect } from 'react';
import { ResumeUploadDropzone } from '@/components/resume-upload-dropzone';
import { Sparkles, FileText } from 'lucide-react';

export function OnboardingGuard({ children, hasProfile }: { children: React.ReactNode, hasProfile: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) return null;

  if (hasProfile) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Hidden children to keep them in DOM but inaccessible */}
      <div className="hidden h-0 w-0 overflow-hidden" aria-hidden="true">
        {children}
      </div>

      {/* Full screen overlay */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#09090f]/95 backdrop-blur-sm p-4 sm:p-6">
        <div className="w-full max-w-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          <div className="p-8 border-b border-white/10 bg-gradient-to-b from-indigo-500/10 to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to JobBuddy AI</h1>
            </div>
            <p className="text-white/70">
              To get started and personalize your dashboard, please upload your resume. 
              Our AI will automatically extract your details to build your profile.
            </p>
          </div>

          <div className="p-8">
            <ResumeUploadDropzone />
            
            <div className="mt-8 pt-6 border-t border-white/10 flex items-start gap-4">
              <div className="mt-1">
                <FileText className="w-5 h-5 text-white/40" />
              </div>
              <div className="text-sm text-white/50">
                <p className="mb-1 font-medium text-white/70">Why do we need this?</p>
                <p>We use your resume to tailor job recommendations, auto-fill applications, and provide targeted career advice using Gemini AI.</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
