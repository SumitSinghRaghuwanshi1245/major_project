import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in your environment variables (.env.local). Please add it and restart the server.");
    }
    
    // Initialize Gemini client inside the handler
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const supabase = await createClient();
    
    // Authenticate user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data
    const formData = await req.formData();
    const file = formData.get('resume') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No resume file provided' }, { status: 400 });
    }

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload resume to storage' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    // Convert file to base64 for Gemini inlineData
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');

    // Prepare prompt
    const prompt = `You are an expert resume parser. Parse the provided resume document and extract the information according to the strict JSON schema provided. Return ONLY valid JSON matching the schema. If a field is not found in the resume, leave it as null, empty string, or empty array.`;

    // Define response schema
    const responseSchema = {
      type: 'OBJECT',
      properties: {
        personal_info: {
          type: 'OBJECT',
          properties: {
            full_name: { type: 'STRING' },
            phone: { type: 'STRING' },
            location: { type: 'STRING' },
          },
        },
        professional_summary: { type: 'STRING' },
        skills: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
        experience: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              company: { type: 'STRING' },
              title: { type: 'STRING' },
              duration: { type: 'STRING' },
              responsibilities: { type: 'ARRAY', items: { type: 'STRING' } },
            },
          },
        },
        education: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              institution: { type: 'STRING' },
              degree: { type: 'STRING' },
              duration: { type: 'STRING' },
            },
          },
        },
        projects: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              name: { type: 'STRING' },
              description: { type: 'STRING' },
            },
          },
        },
        certifications: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
        links: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
      },
    };

    // Call Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type, // usually application/pdf or application/msword
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const parsedText = response.text;
    if (!parsedText) {
      throw new Error('No parsed text returned from Gemini');
    }

    const parsedData = JSON.parse(parsedText);

    // Insert into resumes table
    const { error: resumeError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        file_url: publicUrl,
        file_name: file.name,
        parsed_data: parsedData
      });

    if (resumeError) {
      console.error('Resume insert error:', resumeError);
    }

    // Upsert into profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: parsedData.personal_info?.full_name || '',
        phone: parsedData.personal_info?.phone || '',
        location: parsedData.personal_info?.location || '',
        professional_summary: parsedData.professional_summary || '',
        skills: parsedData.skills || [],
        experience: parsedData.experience || [],
        education: parsedData.education || [],
        projects: parsedData.projects || [],
        certifications: parsedData.certifications || [],
        links: parsedData.links || [],
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile upsert error:', profileError);
    }

    return NextResponse.json({ success: true, data: parsedData, fileUrl: publicUrl });
  } catch (error: any) {
    console.error('Resume parsing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse resume' }, { status: 500 });
  }
}
