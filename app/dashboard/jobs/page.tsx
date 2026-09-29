"use client";

import { useEffect, useState } from "react";
import { Job } from "@/types/jobs";
import { JobCard } from "@/components/jobs/job-card";
import { JobsSkeleton } from "@/components/jobs/jobs-skeleton";
import { JobsEmptyState } from "@/components/jobs/jobs-empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PLATFORMS = ["Remotive", "Arbeitnow", "RemoteOK", "Greenhouse", "Lever", "Workable", "Wellfound", "SerpApi"];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(PLATFORMS);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const { toast } = useToast();

  const fetchJobs = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/jobs/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platforms: selectedPlatforms, forceRefresh }),
      });
      
      const data = await res.json();
      
      if (res.status === 404 && data.error.includes("incomplete")) {
        setIsProfileIncomplete(true);
        setProfileCompleteness(20); // Dummy low score if incomplete
      } else if (!res.ok) {
        throw new Error(data.error || "Failed to fetch jobs");
      } else {
        setJobs(data.data || []);
        setIsProfileIncomplete(false);
        setProfileCompleteness(85); // Dummy high score if successful
        
        if (forceRefresh) {
          toast({
            title: "Jobs Refreshed",
            description: "Successfully fetched the latest job matches.",
          });
        }
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const filteredJobs = jobs.filter(job => selectedPlatforms.includes(job.platform));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6 md:p-8 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Your AI Job Matches
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            We've scanned thousands of job postings across multiple platforms to find the best opportunities matching your profile.
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Platform Filters */}
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(platform => (
                <button
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    selectedPlatforms.includes(platform)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchJobs(true)} 
              disabled={isLoading || isProfileIncomplete}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Job Listings */}
          {isLoading ? (
            <JobsSkeleton />
          ) : filteredJobs.length === 0 || isProfileIncomplete ? (
            <JobsEmptyState 
              onRefresh={() => fetchJobs(true)} 
              isProfileIncomplete={isProfileIncomplete}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Profile Completeness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span>Score</span>
                  <span className="text-primary">{profileCompleteness}%</span>
                </div>
                <Progress value={profileCompleteness} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  A higher score means better AI job matches. Make sure your skills and experience are up to date.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {jobs.filter(j => j.saved_status).slice(0, 3).map(job => (
                  <li key={job.id} className="flex gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium leading-none mb-1">Saved {job.title}</p>
                      <p className="text-muted-foreground text-xs">{job.company}</p>
                    </div>
                  </li>
                ))}
                {jobs.filter(j => j.saved_status).length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No recent activity yet. Save jobs to see them here.</p>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
