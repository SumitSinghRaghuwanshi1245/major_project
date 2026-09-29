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

    // Trigger Inngest function directly to submit
    await inngest.send({
      name: "job/submit.application",
      data: {
        jobId,
        userId: user.id,
        accessToken: session.access_token
      }
    });

    return NextResponse.json({ success: true, message: "Application process resumed" });
  } catch (error: any) {
    console.error('Resume apply error:', error);
    return NextResponse.json({ error: error.message || 'Failed to resume application' }, { status: 500 });
  }
}
