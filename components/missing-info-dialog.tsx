'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function MissingInfoDialog({ 
  jobId, 
  companyName, 
  missingFields, 
  onSuccess 
}: { 
  jobId: string; 
  companyName: string; 
  missingFields: any[]; 
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const supabase = createClient();

  // If there are missing fields, default the dialog to open (or let the parent control it)
  // For this component, it will be rendered per job if missingFields exist, but we might want a trigger button.
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // We update the missing_fields array with the provided values
    const answeredFields = missingFields.map(field => ({
      ...field,
      provided_value: answers[field.name] || ''
    }));

    // Update job in DB
    const { error } = await supabase
      .from('jobs')
      .update({ 
        missing_fields: answeredFields,
        application_status: 'applying' // resume the application
      })
      .eq('id', jobId);

    if (error) {
      toast({ title: 'Error saving info', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Call API to resume the application process
    try {
      await fetch('/api/jobs/resume-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });
      toast({ title: 'Application Resumed', description: 'Agent is continuing the application.' });
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      toast({ title: 'Failed to resume', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white">
        Provide Missing Info
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Complete Application for {companyName}</DialogTitle>
              <DialogDescription>
                Please provide the following required information so our AI can submit your application.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col gap-4 py-4 max-h-[60vh] overflow-y-auto">
              {missingFields.map((field, idx) => (
                <div key={idx} className="space-y-1">
                  <Label htmlFor={`field-${idx}`}>{field.name} <span className="text-red-500">*</span></Label>
                  {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
                  <Input 
                    id={`field-${idx}`} 
                    required 
                    value={answers[field.name] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [field.name]: e.target.value }))}
                    placeholder={`Enter ${field.name.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save & Continue
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
