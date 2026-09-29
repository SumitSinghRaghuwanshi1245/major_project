import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JobsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="flex flex-col h-full border-border/50">
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
            <div className="flex gap-4 w-full">
              <Skeleton className="h-12 w-12 rounded-md flex-shrink-0" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-14" />
            </div>

            <div className="mt-auto pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-1.5 w-full" />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 pt-0">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-10 flex-shrink-0" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
