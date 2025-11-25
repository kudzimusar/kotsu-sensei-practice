import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { corsHeaders } from "../_shared/cors.ts";

// Upload image to Supabase Storage
async function uploadToSupabase(
  supabase: any,
  userId: string,
  file: File,
  fileName: string
): Promise<{ storagePath: string; storageUrl: string } | null> {
  try {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${userId}/${timestamp}-${sanitizedFileName}`;

    const { data, error } = await supabase.storage
      .from('road-sign-images')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('road-sign-images')
      .getPublicUrl(storagePath);

    return {
      storagePath,
      storageUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    return null;
  }
}

// Upload image to AWS S3 (fallback)
async function uploadToAWS(
  supabase: any,
  userId: string,
  file: File,
  fileName: string
): Promise<{ storagePath: string; storageUrl: string } | null> {
  try {
    // Get presigned URL from existing function
    const { data: presignedData, error: presignedError } = await supabase.functions.invoke(
      'generate-s3-presigned-url',
      {
        body: {
          fileName,
          fileType: file.type,
          folder: 'road-sign-images',
        },
      }
    );

    if (presignedError || !presignedData?.presignedUrl) {
      console.error('Failed to get presigned URL:', presignedError);
      return null;
    }

    // Upload file to S3 using presigned URL
    const uploadResponse = await fetch(presignedData.presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      console.error('S3 upload failed:', uploadResponse.status);
      return null;
    }

    return {
      storagePath: presignedData.key,
      storageUrl: presignedData.publicUrl,
    };
  } catch (error) {
    console.error('Error uploading to AWS:', error);
    return null;
  }
}

// Analyze image using Google AI Studio Vision API
async function analyzeImageWithAI(
  imageBase64: string,
  mimeType: string
): Promise<any> {
  const GOOGLE_AI_STUDIO_API_KEY = Deno.env.get('GOOGLE_AI_STUDIO_API_KEY');
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

  const apiKey = GOOGLE_AI_STUDIO_API_KEY || GEMINI_API_KEY;
  
  if (!apiKey && !LOVABLE_API_KEY) {
    throw new Error('No AI API key configured');
  }

  const systemPrompt = `You are an expert Japanese driving instructor. Analyze this Japanese road sign image and provide a detailed analysis.

Return a JSON object with the following structure:
{
  "sign_name_en": "Stop Sign",
  "sign_name_jp": "一時停止",
  "category": "regulatory",
  "meaning": "Must come to a complete stop",
  "explanation": "This red octagonal sign with white text means you must come to a complete stop before proceeding. Check all directions before continuing.",
  "confidence": 0.95,
  "tags": ["stop", "regulatory", "intersection"]
}

Categories must be one of: regulatory, warning, indication, guidance, auxiliary, road-markings
Confidence should be between 0 and 1
Tags should be relevant keywords for searching

Return ONLY valid JSON, no additional text.`;

  // Prepare image data
  const imageData = {
    mimeType,
    data: imageBase64,
  };

  let response;
  let useDirectApi = false;

  // Try LOVABLE_API_KEY first (gateway), then direct Google AI Studio API
  if (LOVABLE_API_KEY) {
    console.log('Using LOVABLE_API_KEY (gateway)');
    response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this Japanese road sign image.' },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        stream: false,
      }),
    });
  } else if (apiKey) {
    console.log('Using Google AI Studio API directly');
    useDirectApi = true;
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                {
                  inlineData: imageData,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json',
          },
        }),
      }
    );
  } else {
    throw new Error('No API key available');
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API error:', response.status, errorText);
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();

  let assistantMessage: string;
  if (useDirectApi) {
    assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else {
    assistantMessage = data.choices?.[0]?.message?.content || '';
  }

  if (!assistantMessage) {
    throw new Error('No response from AI');
  }

  // Parse JSON response
  let analysis;
  try {
    // Remove markdown code blocks if present
    let jsonString = assistantMessage;
    const codeBlockMatch = assistantMessage.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1];
    }

    analysis = JSON.parse(jsonString.trim());
  } catch (e) {
    console.error('Error parsing AI response:', e);
    throw new Error('Failed to parse AI response');
  }

  return analysis;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const imageBase64 = formData.get('imageBase64') as string;
    const mimeType = formData.get('mimeType') as string;

    if (!file && !imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Convert file to base64 if needed
    let base64Data: string;
    let fileMimeType: string;
    let fileName: string;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      base64Data = btoa(String.fromCharCode(...uint8Array));
      fileMimeType = file.type;
      fileName = file.name;
    } else {
      base64Data = imageBase64;
      fileMimeType = mimeType || 'image/jpeg';
      fileName = `road-sign-${Date.now()}.jpg`;
    }

    // Step 1: Upload to storage (try Supabase first, fallback to AWS)
    let storageResult = null;
    let storageType: 'supabase' | 'aws_s3' = 'supabase';

    if (file) {
      // Try Supabase first
      storageResult = await uploadToSupabase(supabase, user.id, file, fileName);
      
      // Fallback to AWS if Supabase fails
      if (!storageResult) {
        console.log('Supabase upload failed, trying AWS fallback...');
        storageResult = await uploadToAWS(supabase, user.id, file, fileName);
        storageType = 'aws_s3';
      }
    } else {
      // For base64, we'll need to convert to File for upload
      const blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], {
        type: fileMimeType,
      });
      const fileFromBase64 = new File([blob], fileName, { type: fileMimeType });
      
      storageResult = await uploadToSupabase(supabase, user.id, fileFromBase64, fileName);
      if (!storageResult) {
        storageResult = await uploadToAWS(supabase, user.id, fileFromBase64, fileName);
        storageType = 'aws_s3';
      }
    }

    if (!storageResult) {
      return new Response(
        JSON.stringify({ error: 'Failed to upload image to storage' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 2: Analyze image with AI
    let analysis;
    try {
      analysis = await analyzeImageWithAI(base64Data, fileMimeType);
    } catch (error) {
      console.error('AI analysis error:', error);
      // Still save the image even if AI analysis fails
      analysis = {
        sign_name_en: 'Unknown Sign',
        sign_name_jp: '不明な標識',
        category: null,
        meaning: 'Unable to analyze sign',
        explanation: 'The AI was unable to analyze this sign. Please try again or upload a clearer image.',
        confidence: 0.0,
        tags: [],
      };
    }

    // Step 3: Save to database
    const { data: savedImage, error: dbError } = await supabase
      .from('road_sign_images')
      .insert({
        user_id: user.id,
        storage_type: storageType,
        storage_path: storageResult.storagePath,
        storage_url: storageResult.storageUrl,
        file_name: fileName,
        file_size: file ? file.size : null,
        mime_type: fileMimeType,
        sign_name_en: analysis.sign_name_en,
        sign_name_jp: analysis.sign_name_jp,
        sign_category: analysis.category,
        sign_meaning: analysis.meaning,
        ai_explanation: analysis.explanation,
        ai_confidence: analysis.confidence || 0.0,
        tags: analysis.tags || [],
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to save image analysis', details: dbError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        image: savedImage,
        analysis,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-road-sign:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

