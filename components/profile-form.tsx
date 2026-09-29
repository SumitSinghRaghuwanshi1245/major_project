'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateProfile } from '@/app/actions/profile';

export function ProfileForm({ initialData, userId }: { initialData: any, userId: string }) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      full_name: initialData.full_name || '',
      phone: initialData.phone || '',
      location: initialData.location || '',
      professional_summary: initialData.professional_summary || '',
      skills: (initialData.skills || []).join(', '), // Comma separated string for easy editing
      experience: initialData.experience || [],
      education: initialData.education || [],
    }
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control,
    name: "experience"
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control,
    name: "education"
  });

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    setMessage(null);

    try {
      // Process skills back into an array
      const processedData = {
        ...data,
        skills: data.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      };

      await updateProfile(userId, processedData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-white/10 pb-2">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" {...register('full_name')} className="bg-white/5 border-white/10" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} className="bg-white/5 border-white/10" />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register('location')} className="bg-white/5 border-white/10" />
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-white/10 pb-2">Professional Summary</h3>
        <Textarea 
          {...register('professional_summary')} 
          className="h-32 bg-white/5 border-white/10"
          placeholder="A brief summary of your professional background..."
        />
      </div>

      {/* Skills */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-white/10 pb-2">Skills</h3>
        <p className="text-xs text-white/50 mb-2">Separate skills with commas</p>
        <Textarea 
          {...register('skills')} 
          className="h-20 bg-white/5 border-white/10"
          placeholder="React, Next.js, TypeScript..."
        />
      </div>

      {/* Experience */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="text-xl font-semibold">Work Experience</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => appendExp({ company: '', title: '', duration: '', responsibilities: [] })}
            className="h-8 border-white/10"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Job
          </Button>
        </div>
        
        {expFields.map((field, index) => (
          <div key={field.id} className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-4 relative group">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeExp(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input {...register(`experience.${index}.company`)} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input {...register(`experience.${index}.title`)} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Duration</Label>
                <Input {...register(`experience.${index}.duration`)} placeholder="e.g. Jan 2020 - Present" className="bg-white/5 border-white/10" />
              </div>
              
              {/* Note: Responsibilities is an array from parsing, we can just allow editing it as a string separated by newlines for simplicity here */}
              <div className="space-y-2 md:col-span-2">
                <Label>Responsibilities</Label>
                <Textarea 
                  {...register(`experience.${index}.responsibilities`)} 
                  className="h-24 bg-white/5 border-white/10" 
                  placeholder="Enter responsibilities..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="text-xl font-semibold">Education</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => appendEdu({ institution: '', degree: '', duration: '' })}
            className="h-8 border-white/10"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Education
          </Button>
        </div>
        
        {eduFields.map((field, index) => (
          <div key={field.id} className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-4 relative group">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeEdu(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Institution</Label>
                <Input {...register(`education.${index}.institution`)} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Degree / Program</Label>
                <Input {...register(`education.${index}.degree`)} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Duration</Label>
                <Input {...register(`education.${index}.duration`)} placeholder="e.g. 2016 - 2020" className="bg-white/5 border-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div className={`p-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message.text}
        </div>
      )}

      <div className="pt-6">
        <Button 
          type="submit" 
          disabled={isSaving} 
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Profile
        </Button>
      </div>
      
    </form>
  );
}
