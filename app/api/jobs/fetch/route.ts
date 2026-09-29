import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Job } from '@/types/jobs';

// Calculate match score helper
function calculateMatchScore(profile: any, jobText: string): number {
  let score = 50 + Math.floor(Math.random() * 20); // Base score 50-70
  const skills = profile.skills || [];
  skills.forEach((skill: string) => {
    if (jobText.toLowerCase().includes(skill.toLowerCase())) {
      score = Math.min(99, score + 10);
    }
  });
  return score;
}

// 1. Remotive API (Free, No Auth)
async function fetchFromRemotive(profile: any): Promise<Partial<Job>[]> {
  try {
    const title = profile.experience?.[0]?.title || 'Software Engineer';
    const response = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(title)}&limit=10`);
    if (!response.ok) return [];
    const data = await response.json();
    
    return (data.jobs || []).slice(0, 5).map((job: any) => ({
      platform: 'Remotive',
      title: job.title,
      company: job.company_name,
      company_logo: job.company_logo,
      location: job.candidate_required_location || 'Remote',
      salary: job.salary || null,
      job_type: job.job_type,
      experience_level: job.title.toLowerCase().includes('senior') ? 'Senior' : 'Mid-level',
      description: job.description.substring(0, 500) + '...',
      tags: job.tags || [],
      match_score: calculateMatchScore(profile, job.description),
      job_url: job.url,
      source_url: job.url,
    }));
  } catch (error) {
    console.error('Error fetching from Remotive:', error);
    return [];
  }
}

// 2. Arbeitnow API (Free, No Auth)
async function fetchFromArbeitnow(profile: any): Promise<Partial<Job>[]> {
  try {
    const response = await fetch('https://www.arbeitnow.com/api/job-board-api');
    if (!response.ok) return [];
    const data = await response.json();
    
    return (data.data || []).slice(0, 5).map((job: any) => ({
      platform: 'Arbeitnow',
      title: job.title,
      company: job.company_name,
      company_logo: null,
      location: job.location || 'Remote',
      salary: null,
      job_type: 'Full-time',
      experience_level: job.title.toLowerCase().includes('senior') ? 'Senior' : 'Mid-level',
      description: job.description.substring(0, 500) + '...',
      tags: job.tags || [],
      match_score: calculateMatchScore(profile, job.description),
      job_url: job.url,
      source_url: job.url,
    }));
  } catch (error) {
    console.error('Error fetching from Arbeitnow:', error);
    return [];
  }
}

// 3. RemoteOK API (Free, No Auth)
async function fetchFromRemoteOK(profile: any): Promise<Partial<Job>[]> {
  try {
    const response = await fetch('https://remoteok.com/api');
    if (!response.ok) return [];
    const data = await response.json();
    
    // First item is legal terms, skip it
    return (data || []).slice(1, 6).map((job: any) => ({
      platform: 'RemoteOK',
      title: job.position,
      company: job.company,
      company_logo: job.company_logo,
      location: job.location || 'Remote',
      salary: null,
      job_type: 'Full-time',
      experience_level: job.position?.toLowerCase().includes('senior') ? 'Senior' : 'Mid-level',
      description: job.description?.substring(0, 500) + '...',
      tags: job.tags || [],
      match_score: calculateMatchScore(profile, job.description || ''),
      job_url: job.url,
      source_url: job.url,
    }));
  } catch (error) {
    console.error('Error fetching from RemoteOK:', error);
    return [];
  }
}

// 4. ATS Direct Endpoints
async function fetchFromATS(profile: any): Promise<Partial<Job>[]> {
  const jobs: Partial<Job>[] = [];
  const greenhouseCompanies = ['discord'];
  const leverCompanies = ['figma'];
  
  // Greenhouse
  for (const company of greenhouseCompanies) {
    try {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${company}/jobs`);
      if (!res.ok) continue;
      const data = await res.json();
      const companyJobs = (data.jobs || []).slice(0, 2).map((job: any) => ({
        platform: 'Greenhouse',
        title: job.title,
        company: company.toUpperCase(),
        company_logo: null,
        location: job.location?.name || 'Remote',
        salary: null,
        job_type: 'Full-time',
        experience_level: job.title.toLowerCase().includes('senior') ? 'Senior' : 'Mid-level',
        description: 'View full description on Greenhouse.',
        tags: [],
        match_score: calculateMatchScore(profile, job.title),
        job_url: job.absolute_url,
        source_url: job.absolute_url,
      }));
      jobs.push(...companyJobs);
    } catch (e) {
      console.error(`Error fetching Greenhouse for ${company}`, e);
    }
  }

  // Lever
  for (const company of leverCompanies) {
    try {
      const res = await fetch(`https://api.lever.co/v0/postings/${company}`);
      if (!res.ok) continue;
      const data = await res.json();
      const companyJobs = (data || []).slice(0, 2).map((job: any) => ({
        platform: 'Lever',
        title: job.text,
        company: company.toUpperCase(),
        company_logo: null,
        location: job.categories?.location || 'Remote',
        salary: null,
        job_type: job.categories?.commitment || 'Full-time',
        experience_level: job.text.toLowerCase().includes('senior') ? 'Senior' : 'Mid-level',
        description: job.descriptionPlain?.substring(0, 500) + '...',
        tags: [],
        match_score: calculateMatchScore(profile, job.descriptionPlain || ''),
        job_url: job.hostedUrl,
        source_url: job.hostedUrl,
      }));
      jobs.push(...companyJobs);
    } catch (e) {
      console.error(`Error fetching Lever for ${company}`, e);
    }
  }

  return jobs;
}

// 5. Original SerpApi (Handled Gracefully)
async function fetchFromSerpApi(profile: any, platform: string): Promise<Partial<Job>[]> {
  const SERPAPI_KEY = process.env.SERPAPI_KEY;
  if (!SERPAPI_KEY) {
    return []; // Skip if no key
  }
  
  const title = profile.experience?.[0]?.title || 'Software Engineer';
  const query = `site:${platform.toLowerCase()}.com/jobs "${title}"`;
  
  try {
    const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.organic_results) return [];
    
    return data.organic_results.slice(0, 2).map((result: any) => ({
      platform: 'SerpApi',
      title: result.title.split('-')[0].split('|')[0].trim() || 'Job Opening',
      company: result.source || `${platform} Listing`,
      company_logo: null,
      location: profile.location || 'Remote',
      salary: null,
      job_type: 'Full-time',
      experience_level: result.title.toLowerCase().includes('senior') ? 'Senior' : 'Mid-level',
      description: result.snippet,
      tags: [],
      match_score: calculateMatchScore(profile, result.snippet || ''),
      job_url: result.link,
      source_url: result.link,
    }));
  } catch (error) {
    console.error(`Error querying SerpApi for ${platform}:`, error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Authenticate user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { platforms = [], forceRefresh = false } = await req.json().catch(() => ({}));

    // Check if jobs were fetched within the last 6 hours
    if (!forceRefresh) {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .gte('fetched_at', sixHoursAgo)
        .order('match_score', { ascending: false });
        
      if (platforms.length > 0) {
         query = query.in('platform', platforms);
      }

      const { data: recentJobs, error: recentJobsError } = await query;

      if (recentJobsError) {
        console.error('Error checking recent jobs:', recentJobsError);
      } else if (recentJobs && recentJobs.length > 0) {
        return NextResponse.json({ success: true, cached: true, data: recentJobs });
      }
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found or incomplete' }, { status: 404 });
    }

    // Determine which fetchers to run based on requested platforms
    const fetchPromises: Promise<Partial<Job>[]>[] = [];
    
    if (platforms.length === 0 || platforms.includes('Remotive')) fetchPromises.push(fetchFromRemotive(profile));
    if (platforms.length === 0 || platforms.includes('Arbeitnow')) fetchPromises.push(fetchFromArbeitnow(profile));
    if (platforms.length === 0 || platforms.includes('RemoteOK')) fetchPromises.push(fetchFromRemoteOK(profile));
    if (platforms.length === 0 || platforms.includes('Greenhouse') || platforms.includes('Lever')) fetchPromises.push(fetchFromATS(profile));
    if (platforms.length === 0 || platforms.includes('Workable')) fetchPromises.push(fetchFromSerpApi(profile, 'Workable'));
    if (platforms.length === 0 || platforms.includes('Wellfound')) fetchPromises.push(fetchFromSerpApi(profile, 'Wellfound'));
    if (platforms.length === 0 || platforms.includes('SerpApi')) fetchPromises.push(fetchFromSerpApi(profile, 'Greenhouse'));

    // Wait for all fetches to complete
    const results = await Promise.allSettled(fetchPromises);
    
    const allFetchedJobs: Partial<Job>[] = [];
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allFetchedJobs.push(...result.value);
      }
    });

    if (allFetchedJobs.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Prepare jobs for insert
    const fetchedAt = new Date().toISOString();
    const jobsToInsert = allFetchedJobs.map(job => ({
      ...job,
      user_id: user.id,
      fetched_at: fetchedAt,
      created_at: fetchedAt,
      applied_status: false,
      saved_status: false,
    }));

    // Insert into database
    const { data: insertedJobs, error: insertError } = await supabase
      .from('jobs')
      .insert(jobsToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting jobs:', insertError);
      return NextResponse.json({ error: 'Failed to save fetched jobs' }, { status: 500 });
    }

    // Filter inserted jobs if specific platforms were requested
    let finalJobs = insertedJobs;
    if (platforms.length > 0) {
       finalJobs = insertedJobs.filter(job => platforms.includes(job.platform));
    }

    return NextResponse.json({ 
      success: true, 
      cached: false, 
      data: finalJobs.sort((a, b) => b.match_score - a.match_score) 
    });
  } catch (error: any) {
    console.error('Jobs fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch jobs' }, { status: 500 });
  }
}
