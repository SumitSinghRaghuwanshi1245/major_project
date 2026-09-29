import { inngest } from "../client";
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// We use the admin client in background jobs to bypass RLS if needed, or pass user auth
// But since we are server-side and have the user_id, we can just use the service role key if needed.
// For now, let's use the regular client and pass the service role key or just use anon key if RLS allows it.
// Actually, it's safer to use service_role for background jobs.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export const detectJobFields = inngest.createFunction(
  { id: "detect-job-fields" },
  { event: "job/detect.fields" },
  async ({ event, step }) => {
    const { jobId, userId, accessToken } = event.data;

    const supabase = createClient(
      supabaseUrl, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    );

    // 1. Fetch Job details
    const job = await step.run("fetch-job-details", async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();
        
      if (error || !data) {
        throw new Error(`Job not found: ${error?.message}`);
      }
      return data;
    });

    // 2. Fetch User Profile
    const profile = await step.run("fetch-user-profile", async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (error) {
        console.warn(`Profile not found for user ${userId}`);
        return null; // Might be a new user
      }
      return data;
    });

    // 3. Initialize Stagehand & Extract Fields
    const extractionResult = await step.run("extract-form-fields", async () => {
      // Setup stagehand
      const stagehand = new Stagehand({
        env: "LOCAL",
        modelName: "openai/google/gemma-2-9b-it:free",
        modelClientOptions: {
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: process.env.OPENROUTER_API_KEY,
        },
      });

      const { page } = await stagehand.init();

      try {
        await page.goto(job.job_url, { waitUntil: "domcontentloaded" });
        
        // Use Stagehand extract to find required fields
        const extraction = await page.extract({
          instruction: "Identify all the form fields required to apply for this job. We need to know what information is asked. For example: First Name, Last Name, Email, Resume, LinkedIn URL, etc.",
          schema: z.object({
            fields: z.array(z.object({
              name: z.string().describe("The human-readable name of the field (e.g., 'First Name', 'Resume')"),
              type: z.string().describe("The type of the field (e.g., 'text', 'email', 'file', 'select')"),
              required: z.boolean().describe("Whether this field is explicitly required to submit the form"),
              description: z.string().optional().describe("Any extra context about the field")
            }))
          })
        });

        const sessionId = stagehand.browserbaseSessionID;
        await stagehand.close();

        return {
          fields: extraction.fields,
          sessionId
        };
      } catch (error) {
        await stagehand.close();
        throw error;
      }
    });

    // 4. Compare fields with profile to find missing ones
    const analysis = await step.run("analyze-missing-fields", async () => {
      const requiredFields = extractionResult.fields.filter(f => f.required);
      const missingFields: any[] = [];

      // Simple heuristic mapping (in reality, an LLM could do this mapping better)
      const profileString = JSON.stringify(profile || {}).toLowerCase();
      
      for (const field of requiredFields) {
        const fieldName = field.name.toLowerCase();
        
        // Basic checks against profile
        if (fieldName.includes("resume") || fieldName.includes("cv")) {
          // Check if user has a resume uploaded
          const { data: resumes } = await supabase.from('resumes').select('id').eq('user_id', userId).limit(1);
          if (!resumes || resumes.length === 0) {
            missingFields.push(field);
          }
        } else if (fieldName.includes("name") && !profile?.full_name) {
          missingFields.push(field);
        } else if (fieldName.includes("phone") && !profile?.phone) {
          missingFields.push(field);
        } else if (fieldName.includes("location") || fieldName.includes("city")) {
          if (!profile?.location) missingFields.push(field);
        } else if (fieldName.includes("linkedin") || fieldName.includes("portfolio")) {
          // Check links array
          const links = profile?.links || [];
          if (links.length === 0) missingFields.push(field);
        }
        // If it's a generic question not covered by basic profile, we might flag it
      }

      return {
        requiredFields,
        missingFields
      };
    });

    // 5. Update Job record
    await step.run("update-job-status", async () => {
      const hasMissingFields = analysis.missingFields.length > 0;
      const status = hasMissingFields ? 'missing_info' : 'applying'; // If nothing missing, we go straight to applying (or wait for next step)

      await supabase
        .from("jobs")
        .update({
          application_status: status,
          browserbase_session_id: extractionResult.sessionId,
          required_fields: analysis.requiredFields,
          missing_fields: analysis.missingFields
        })
        .eq("id", jobId);

      return { status, hasMissingFields };
    });

    // 6. Trigger next step if ready
    if (analysis.missingFields.length === 0) {
      await step.sendEvent("trigger-application", {
        name: "job/submit.application",
        data: {
          jobId,
          userId,
          accessToken
        }
      });
    }

    return { success: true, missingFieldsCount: analysis.missingFields.length };
  }
);
