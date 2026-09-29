"use client";

import { Job } from "@/types/jobs";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bookmark, BookmarkCheck, ExternalLink, MapPin, Briefcase, DollarSign, Clock, Bot, MousePointerClick, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(job.saved_status);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const supabase = createClient();

  const handleSaveToggle = async () => {
    setIsSaving(true);
    const newStatus = !isSaved;
    setIsSaved(newStatus);

    const { error } = await supabase
      .from("jobs")
      .update({ saved_status: newStatus })
      .eq("id", job.id);

    if (error) {
      setIsSaved(!newStatus);
      toast({
        title: "Error saving job",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: newStatus ? "Job saved" : "Job removed from saved",
        description: newStatus ? "You can view this in your saved jobs." : "Job has been removed from your saved list.",
      });
    }
    setIsSaving(false);
  };

  const handleAutoApply = async () => {
    setIsApplying(true);
    try {
      // Trigger the Inngest function for auto apply
      const res = await fetch('/api/jobs/auto-apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId: job.id })
      });
      
      if (!res.ok) {
        throw new Error('Failed to start application process');
      }
      
      toast({
        title: "Agent Started",
        description: "AI Agent is now processing your application in the background.",
      });
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card className="flex flex-col h-full transition-all hover:shadow-md border-border/50">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="flex gap-4">
          <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0 border flex items-center justify-center">
            {job.company_logo ? (
              <Image
                src={job.company_logo}
                alt={`${job.company} logo`}
                fill
                className="object-cover"
              />
            ) : (
              <span className="font-semibold text-lg text-muted-foreground">
                {job.company.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-none mb-1">{job.title}</h3>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
            {job.platform}
          </Badge>
          {job.application_status && job.application_status !== 'idle' && (
            <Badge 
              variant={
                job.application_status === 'applied' ? 'default' : 
                job.application_status === 'missing_info' ? 'destructive' : 
                job.application_status === 'failed' ? 'destructive' : 'secondary'
              } 
              className="capitalize"
            >
              {job.application_status.replace('_', ' ')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{job.location}</span>
          </div>
          {job.salary && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="truncate">{job.salary}</span>
            </div>
          )}
          {job.job_type && (
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="truncate">{job.job_type}</span>
            </div>
          )}
          {job.experience_level && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span className="truncate">{job.experience_level}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {job.tags.slice(0, 4).map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
          {job.tags.length > 4 && (
            <Badge variant="secondary" className="text-xs font-normal">
              +{job.tags.length - 4}
            </Badge>
          )}
        </div>

        <div className="mt-auto pt-4 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium">Match Score</span>
            <span className="font-semibold text-primary">{Math.round(job.match_score)}%</span>
          </div>
          <Progress value={job.match_score} className="h-1.5" />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-0">
        <Button className="w-full gap-2" onClick={() => setDialogOpen(true)}>
          Apply Now
          <ExternalLink className="h-4 w-4" />
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>How would you like to apply?</DialogTitle>
              <DialogDescription>
                Choose whether to apply manually on the company's website or let our AI agent handle the application for you.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center justify-center gap-2 hover:bg-muted/50"
                asChild
                onClick={() => setDialogOpen(false)}
              >
                <a href={job.job_url} target="_blank" rel="noopener noreferrer">
                  <MousePointerClick className="h-6 w-6 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold">Apply Manually</div>
                    <div className="text-xs text-muted-foreground font-normal mt-1">Open in new tab and fill out yourself</div>
                  </div>
                </a>
              </Button>
              
              <Button 
                variant="default" 
                className="h-auto p-4 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
                onClick={handleAutoApply}
                disabled={isApplying}
              >
                {isApplying ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Bot className="h-6 w-6" />
                )}
                <div className="text-center">
                  <div className="font-semibold">Apply Automatically</div>
                  <div className="text-xs text-primary-foreground/80 font-normal mt-1">AI agent will detect fields and submit</div>
                </div>
                {/* Micro-animation shimmer effect for the premium feel */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button 
          variant={isSaved ? "secondary" : "outline"} 
          size="icon" 
          className="shrink-0"
          onClick={handleSaveToggle}
          disabled={isSaving}
          aria-label="Save job"
        >
          {isSaved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
}
