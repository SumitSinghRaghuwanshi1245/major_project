import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/profile-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileEdit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MissingInfoDialog } from '@/components/missing-info-dialog';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch any jobs that are blocked because of missing profile information
  const { data: blockedJobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', user.id)
    .eq('application_status', 'missing_info');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Profile</h1>
        <p className="text-white/60">
          Manage your personal information, experience, and skills. This information is used to match you with jobs.
        </p>
      </div>

      {blockedJobs && blockedJobs.length > 0 && (
        <div className="space-y-4 mb-8">
          {blockedJobs.map((job) => (
            <Alert key={job.id} className="border-amber-500/50 bg-amber-500/10 text-amber-200">
              <AlertCircle className="h-4 w-4 stroke-amber-500" />
              <AlertTitle className="text-amber-500 font-semibold flex items-center justify-between">
                Missing Information for {job.company} Application
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                <p>
                  To automatically apply for <strong>{job.title}</strong>, we need a few more details:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-1 text-amber-200/90 text-sm">
                  {Array.isArray(job.missing_fields) && job.missing_fields.map((field: any, idx: number) => (
                    <li key={idx}>
                      <span className="font-medium">{field.name}</span>
                      {field.description && <span className="opacity-80"> - {field.description}</span>}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-3 pt-2">
                  <MissingInfoDialog 
                    jobId={job.id} 
                    companyName={job.company} 
                    missingFields={job.missing_fields} 
                    onSuccess={() => {}} 
                  />
                  <Button variant="ghost" size="sm" className="text-amber-300/80 hover:text-amber-200 hover:bg-amber-500/10" asChild>
                    <Link href="/dashboard/jobs">
                      Back to Jobs
                    </Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div id="profile-form" className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 relative">
        {/* Subtle highlight if there are blocked jobs */}
        {blockedJobs && blockedJobs.length > 0 && (
          <div className="absolute inset-0 rounded-2xl ring-2 ring-amber-500/20 pointer-events-none" />
        )}
        <ProfileForm initialData={profile || {}} userId={user.id} />
      </div>
    </div>
  );
}
