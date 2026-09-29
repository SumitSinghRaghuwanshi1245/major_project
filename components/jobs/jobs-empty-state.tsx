import { Button } from "@/components/ui/button";
import { SearchX, Sparkles } from "lucide-react";
import Link from "next/link";

interface JobsEmptyStateProps {
  onRefresh?: () => void;
  isProfileIncomplete?: boolean;
}

export function JobsEmptyState({ onRefresh, isProfileIncomplete }: JobsEmptyStateProps) {
  if (isProfileIncomplete) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px] border rounded-lg bg-muted/20 border-dashed">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Complete Your Profile</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          We need to know more about your skills and experience to find the best job matches for you. 
          Head over to your profile to finish setting up.
        </p>
        <Button asChild>
          <Link href="/dashboard/profile">
            Complete Profile
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px] border rounded-lg bg-muted/20 border-dashed">
      <div className="bg-muted p-4 rounded-full mb-4">
        <SearchX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        We couldn't find any recent job postings that match your profile right now. 
        Try adjusting your preferences or check back later.
      </p>
      {onRefresh && (
        <Button onClick={onRefresh} variant="outline">
          Refresh Matches
        </Button>
      )}
    </div>
  );
}
