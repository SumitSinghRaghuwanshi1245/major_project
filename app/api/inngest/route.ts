import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { detectJobFields } from "@/lib/inngest/functions/detect-job-fields";
import { submitJobApplication } from "@/lib/inngest/functions/submit-job-application";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    detectJobFields,
    submitJobApplication,
  ],
});
