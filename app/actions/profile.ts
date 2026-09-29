'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(userId: string, data: any) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name,
      phone: data.phone,
      location: data.location,
      professional_summary: data.professional_summary,
      skills: data.skills,
      experience: data.experience,
      education: data.education,
      projects: data.projects,
      certifications: data.certifications,
      links: data.links,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard/profile');
  return { success: true };
}
