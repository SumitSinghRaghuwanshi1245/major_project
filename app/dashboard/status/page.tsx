import { createClient } from "@/lib/supabase/server";
import { JobCard } from "@/components/jobs/job-card";
import { redirect } from "next/navigation";
import { Job } from "@/types/jobs";
import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ApplicationStatusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch jobs that the user has interacted with (applied, applying, missing_info, failed)
  const { data: applications, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", user.id)
    .neq("application_status", "idle")
    .order("updated_at", { ascending: false });

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Application Status</h1>
          <p className="text-white/60">
            Track your automated and manual job applications in real-time.
          </p>
        </div>
      </div>

      {!applications || applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
          <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <ClipboardList className="h-6 w-6 text-white/60" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
          <p className="text-white/60 max-w-sm mb-6">
            When you apply for a job or the AI agent applies on your behalf, it will show up here.
          </p>
          <Button asChild>
            <Link href="/dashboard/jobs">Find Jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {applications.map((job: Job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
