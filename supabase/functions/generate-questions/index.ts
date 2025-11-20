import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const GOOGLE_AI_STUDIO_API_KEY = Deno.env.get('GOOGLE_AI_STUDIO_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Use GEMINI_API_KEY as primary, fallback to GOOGLE_AI_STUDIO_API_KEY
    const apiKey = GEMINI_API_KEY || GOOGLE_AI_STUDIO_API_KEY;
    
    if (!apiKey) {
      throw new Error('Neither GEMINI_API_KEY nor GOOGLE_AI_STUDIO_API_KEY is configured');
    }
    
    const usingFallback = !GEMINI_API_KEY && !!GOOGLE_AI_STUDIO_API_KEY;
    if (usingFallback) {
      console.log('Using GOOGLE_AI_STUDIO_API_KEY as fallback for GEMINI_API_KEY');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error) throw error;
      userId = user?.id || null;
    }

    const { category, difficulty, count, language, concept } = await req.json();

    const startTime = Date.now();

    // Build the prompt
    const systemPrompt = `You are an expert Japanese driving test question writer. Generate realistic, accurate practice questions based on official Japanese traffic rules.

REQUIREMENTS:
- Questions must be True/False format
- Must reference specific articles or rules when applicable
- Explanations must be clear, concise, and educational
- Questions should test understanding, not just memorization
- Difficulty: ${difficulty || 'medium'}
- Category: ${category || 'general'}
- Language: ${language || 'en'}

Generate ${count || 5} new, unique questions that test different aspects of the concept: "${concept || 'driving rules'}"`;

    const examples = `
EXAMPLE QUESTIONS:
1. Q: "When making a right turn at the intersection, you must move over as close as possible to the center of the road and slow down, pass just in front of the center of the intersection."
   A: TRUE
   E: "Article 34 requires vehicles to stay close to center line when turning right to allow other traffic to pass on left."

2. Q: "When there is an obstacle ahead, drivers must stop or slow down and yield to the vehicle moving in the opposite direction."
   A: TRUE
   E: "The vehicle on the side with the obstacle must yield to oncoming traffic."`;

    // Call Gemini API for text generation (using primary or fallback key)
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${examples}\n\nNow generate ${count || 5} new questions in this exact JSON format:
{
  "questions": [
    {
      "question": "Question text here",
      "answer": true,
      "explanation": "Explanation here",
      "source_concept": "Specific rule or concept",
      "difficulty_level": "medium",
      "needs_image": false,
      "image_description": "Description of traffic sign or situation if needs_image is true"
    }
  ]
}

Set needs_image to true for questions about road signs, traffic signals, or visual scenarios. Provide a clear image_description.
Make sure to return valid JSON only, no additional text.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    // Parse the JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    const questions = parsedResponse.questions || [];

    // Generate images for questions that need them
    const questionsWithImages = await Promise.all(
      questions.map(async (q: any) => {
        let figureUrl = null;

        if (q.needs_image && q.image_description) {
          try {
            const imagePrompt = `Generate a clear, simple illustration of: ${q.image_description}. Style: Clean vector graphic suitable for a driving test, high contrast, educational.`;
            
            // Try LOVABLE_API_KEY first, fallback to GOOGLE_AI_STUDIO_API_KEY
            if (LOVABLE_API_KEY) {
              try {
                const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    model: 'google/gemini-2.5-flash-image-preview',
                    messages: [{
                      role: 'user',
                      content: imagePrompt
                    }],
                    modalities: ['image', 'text']
                  })
                });

                if (imageResponse.ok) {
                  const imageData = await imageResponse.json();
                  figureUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
                }
              } catch (lovableError) {
                console.warn('LOVABLE_API_KEY image generation failed, trying fallback:', lovableError);
              }
            }
            
            // Fallback to GOOGLE_AI_STUDIO_API_KEY if LOVABLE failed or not available
            if (!figureUrl && GOOGLE_AI_STUDIO_API_KEY) {
              try {
                console.log('Using GOOGLE_AI_STUDIO_API_KEY fallback for image generation');
                // Note: Google AI Studio doesn't have direct image generation in this API
                // This is a placeholder for future implementation
                // For now, we'll skip image generation if LOVABLE fails
                console.log('Image generation fallback not yet implemented for Google AI Studio');
              } catch (googleError) {
                console.error('Google AI Studio fallback also failed:', googleError);
              }
            }
          } catch (imgError) {
            console.error('Error in image generation process:', imgError);
          }
        }

        return {
          ...q,
          figure_url: figureUrl
        };
      })
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Store questions in database
    const questionsToInsert = questionsWithImages.map((q: any) => ({
      question: q.question,
      answer: q.answer,
      explanation: q.explanation,
      test_category: category || 'general',
      difficulty_level: q.difficulty_level || difficulty || 'medium',
      source_concept: q.source_concept || concept,
      language: language || 'en',
      figure_url: q.figure_url,
      figure_description: q.image_description,
      status: 'approved' // Auto-approve for immediate use
    }));

    const { data: insertedQuestions, error: insertError } = await supabase
      .from('ai_generated_questions')
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting questions:', insertError);
      throw insertError;
    }

    // Log the generation
    const { error: logError } = await supabase
      .from('question_generation_logs')
      .insert({
        prompt_used: systemPrompt,
        model_used: 'gemini-2.0-flash-exp',
        source_concept: concept,
        target_category: category,
        target_language: language,
        questions_requested: count || 5,
        questions_generated: questions.length,
        generation_duration_ms: duration,
        triggered_by: userId
      });

    if (logError) {
      console.error('Error logging generation:', logError);
    }

    return new Response(JSON.stringify({
      success: true,
      questions: insertedQuestions,
      count: insertedQuestions?.length || 0,
      duration_ms: duration
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-questions function:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
