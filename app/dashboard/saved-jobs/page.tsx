import { createClient } from "@/lib/supabase/server";
import { JobCard } from "@/components/jobs/job-card";
import { redirect } from "next/navigation";
import { Job } from "@/types/jobs";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SavedJobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: savedJobs, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", user.id)
    .eq("saved_status", true)
    .order("created_at", { ascending: false });

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Saved Jobs</h1>
          <p className="text-white/60">
            Jobs you've bookmarked for later. 
          </p>
        </div>
      </div>

      {!savedJobs || savedJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
          <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <Briefcase className="h-6 w-6 text-white/60" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No saved jobs yet</h3>
          <p className="text-white/60 max-w-sm mb-6">
            When you see a job you like, click the bookmark icon to save it here for later review.
          </p>
          <Button asChild>
            <Link href="/dashboard/jobs">Browse Jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {savedJobs.map((job: Job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
