import { createClient } from '@/lib/supabase/server';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Download, UploadCloud, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function ResumePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: resumes } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Resumes</h1>
          <p className="text-white/60">
            View and manage your uploaded resumes. Upload a new resume to update your profile using our AI.
          </p>
        </div>
      </div>

      {!resumes || resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 rounded-2xl text-center">
          <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
            <UploadCloud className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No resumes found</h3>
          <p className="text-white/50 max-w-md">
            You haven't uploaded any resumes yet. Your first upload will automatically populate your profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div key={resume.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-colors group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-indigo-500/10 rounded-xl">
                    <FileText className="w-8 h-8 text-indigo-400" />
                  </div>
                  <a href={resume.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 opacity-0 group-hover:opacity-100 bg-white/5 hover:bg-white/10">
                    <Download className="w-4 h-4 text-white/70" />
                  </a>
                </div>
                
                <h3 className="text-lg font-medium text-white mb-1 truncate" title={resume.file_name}>
                  {resume.file_name}
                </h3>
                
                <div className="flex flex-col gap-2 mt-4 text-sm text-white/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-white/30" />
                    <span>{new Date(resume.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white/30" />
                    <span>{formatDistanceToNow(new Date(resume.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex justify-between items-center">
                <span className="text-xs font-medium text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-md">
                  Parsed by AI
                </span>
                <a 
                  href={resume.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-white hover:text-indigo-400 transition-colors"
                >
                  View File &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
