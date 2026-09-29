import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { inngest } from "@/lib/inngest/client";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Authenticate user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user;

    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Update job status to 'detecting_fields'
    const { error: updateError } = await supabase
      .from('jobs')
      .update({ application_status: 'detecting_fields' })
      .eq('id', jobId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error("Error updating job:", updateError);
      return NextResponse.json({ error: 'Failed to update job status' }, { status: 500 });
    }

    // Trigger Inngest function
    await inngest.send({
      name: "job/detect.fields",
      data: {
        jobId,
        userId: user.id,
        accessToken: session.access_token
      }
    });

    return NextResponse.json({ success: true, message: "Application process started" });
  } catch (error: any) {
    console.error('Auto apply error:', error);
    return NextResponse.json({ error: error.message || 'Failed to start application' }, { status: 500 });
  }
}
