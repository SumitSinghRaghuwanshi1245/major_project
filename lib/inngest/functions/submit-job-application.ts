import { inngest } from "../client";
import { Stagehand } from "@browserbasehq/stagehand";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export const submitJobApplication = inngest.createFunction(
  { 
    id: "submit-job-application",
    concurrency: {
      limit: 1, // To avoid rate limiting from job platforms or Browserbase
      key: "event.data.userId" // 1 application at a time per user
    }
  },
  { event: "job/submit.application" },
  async ({ event, step }) => {
    const { jobId, userId, accessToken } = event.data;
    
    // Create authenticated client using the passed access token
    const supabase = createClient(
      supabaseUrl, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    );

    // 1. Fetch Job and Profile
    const { job, profile, resumeUrl } = await step.run("fetch-data", async () => {
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();
        
      if (jobError || !jobData) throw new Error(`Job not found: ${jobError?.message}`);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      // Get latest resume
      const { data: resumes } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      return {
        job: jobData,
        profile: profileData,
        resumeUrl: resumes?.[0]?.file_url
      };
    });

    // 2. Set status to applying
    await step.run("update-status-applying", async () => {
      await supabase
        .from("jobs")
        .update({ application_status: 'applying' })
        .eq("id", jobId);
    });

    // 3. Initialize Stagehand & Submit Application
    const result = await step.run("submit-application", async () => {
      const stagehand = new Stagehand({
        env: "LOCAL",
        modelName: "openai/google/gemma-2-9b-it:free",
        modelClientOptions: {
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: process.env.OPENROUTER_API_KEY,
        },
      });

      const { page, browserbaseSessionID } = await stagehand.init();
      let sessionId = browserbaseSessionID;

      try {
        await page.goto(job.job_url, { waitUntil: "domcontentloaded" });
        
        // Extract any custom answers the user provided via the Missing Info dialog
        const customAnswers = (job.missing_fields || [])
          .filter((f: any) => f.provided_value)
          .map((f: any) => `${f.name}: ${f.provided_value}`)
          .join('\n');

        // Construct the prompt using profile data
        const actionPrompt = `
          You are an AI assistant applying for a job on behalf of the user.
          Here is their profile information:
          Name: ${profile?.full_name || ''}
          Phone: ${profile?.phone || ''}
          Location: ${profile?.location || ''}
          Links: ${(profile?.links || []).join(', ')}
          Experience: ${JSON.stringify(profile?.experience || [])}
          Education: ${JSON.stringify(profile?.education || [])}
          
          ${customAnswers ? `Here are additional specific answers the user provided for this job application:\n${customAnswers}` : ''}
          
          Instructions:
          1. Fill out ALL required fields using the profile information.
          2. IMPORTANT: If a required field asks for information not explicitly in the profile (e.g., sponsorship, specific tech questions, gender, race, veteran status), DO NOT fail. Infer a reasonable default or safely select an option like 'No', 'Decline to answer', 'N/A', or the most standard industry answer rather than leaving it blank or failing to find an action.
          3. If a resume upload is required, unfortunately we cannot upload files directly via AI text yet. If it's a strict requirement that blocks submission, you may fail. If you can provide a link instead, use: ${resumeUrl || ''}.
          4. Click the submit button to complete the application.
        `;

        await page.act(actionPrompt);
        
        // Give it a moment to process the submission
        await page.waitForTimeout(3000);
        
        await stagehand.close();
        
        return { success: true, sessionId };
      } catch (error: any) {
        await stagehand.close();
        throw new Error(`Failed to submit application: ${error.message}`);
      }
    });

    // 4. Update final status
    await step.run("update-final-status", async () => {
      await supabase
        .from("jobs")
        .update({ 
          application_status: 'applied',
          applied_status: true,
          browserbase_session_id: result.sessionId 
        })
        .eq("id", jobId);
    });

    return { success: true, jobId };
  }
);
