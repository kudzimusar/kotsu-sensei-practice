import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { findWikimediaImage, incrementImageUsage } from "../_shared/wikimedia-image-lookup.ts";

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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Use GOOGLE_AI_STUDIO_API_KEY as primary, then GEMINI_API_KEY
    const apiKey = GOOGLE_AI_STUDIO_API_KEY || GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('No API key configured. Please set GOOGLE_AI_STUDIO_API_KEY or GEMINI_API_KEY');
    }
    
    console.log('API Keys available: GOOGLE_AI_STUDIO=', !!GOOGLE_AI_STUDIO_API_KEY, 'GEMINI=', !!GEMINI_API_KEY);

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error) throw error;
      userId = user?.id || null;
    }

    const { category, difficulty, count, language, concept, road_sign_image_id } = await req.json();

    const startTime = Date.now();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    // Fetch road sign image if provided
    let roadSignImage = null;
    if (road_sign_image_id) {
      const { data: signData, error: signError } = await supabase
        .from('road_sign_images')
        .select('*')
        .eq('id', road_sign_image_id)
        .single();
      
      if (!signError && signData) {
        roadSignImage = signData;
      }
    }

    // Build the prompt
    let imageContext = '';
    if (roadSignImage) {
      imageContext = `\n\nIMPORTANT: Generate questions based on this specific road sign image:
- Sign Name (EN): ${roadSignImage.sign_name_en || 'Unknown'}
- Sign Name (JP): ${roadSignImage.sign_name_jp || '不明'}
- Category: ${roadSignImage.sign_category || 'Unknown'}
- Meaning: ${roadSignImage.sign_meaning || 'Not analyzed'}
- AI Explanation: ${roadSignImage.ai_explanation || 'No explanation available'}
- Image URL: ${roadSignImage.storage_url || 'N/A'}

Generate questions specifically about this sign. Include the image URL in the question data.`;
    }

    const systemPrompt = `You are an expert Japanese driving license examination question writer creating questions for the 仮免許 (provisional license) and 本免許 (full license) tests based on Japan's 道路交通法 (Road Traffic Act).

CRITICAL REQUIREMENTS FOR AUTHENTIC JAPANESE TEST QUESTIONS:

1. QUESTION STYLE:
   - Use precise, formal language similar to official exams
   - Include questions with tricky wording that test careful reading
   - Use phrases like "必ず〜しなければならない" (must always), "〜することができる" (may/can), "〜してはならない" (must not)
   - Include questions where the answer depends on specific conditions or exceptions

2. QUESTION TYPES TO INCLUDE:
   - Speed regulations (速度規制): speed limits in different zones, situations
   - Right-of-way rules (優先関係): intersections, narrow roads, emergency vehicles
   - Parking/stopping rules (駐停車): prohibited areas, exceptions
   - Traffic signs and markings (標識・標示): meaning and required actions
   - Vehicle operation (車両の運転): safe driving distance, overtaking, lane changes
   - Special situations: rain, fog, night driving, pedestrians, school zones
   - Emergency procedures: accidents, breakdowns, yielding to emergency vehicles

3. DIFFICULTY VARIATIONS:
   - Easy: Straightforward rules with clear true/false answers
   - Medium: Rules with specific conditions or common misconceptions
   - Hard: Exceptions to rules, tricky wording, situation-dependent answers

4. INCLUDE THESE AUTHENTIC PATTERNS:
   - Questions about specific distances (e.g., 5m, 10m from intersections)
   - Questions about specific speeds (30km/h zones, highway speeds)
   - Questions testing exceptions (when rules DON'T apply)
   - Questions with absolute statements that are FALSE (e.g., "always", "never" when there are exceptions)

- Difficulty: ${difficulty || 'medium'}
- Category: ${category || 'general'}
- Language: ${language || 'en'} (If English, use clear formal English. Include Japanese terms in parentheses for key concepts)${imageContext}

Generate ${count || 5} unique questions testing different aspects of: "${concept || 'driving rules'}"`;

    const examples = `
EXAMPLE HIGH-QUALITY QUESTIONS:

1. Q: "Vehicles must stop at least 10 meters before a railroad crossing that has no gates or warning signals."
   A: FALSE
   E: "According to Article 33, vehicles must stop immediately before (直前) the railroad crossing, not 10 meters before. The 10-meter rule applies to parking restrictions near intersections."

2. Q: "When an emergency vehicle (緊急自動車) approaches with sirens, you must always pull over to the left side of the road and stop."
   A: FALSE
   E: "While you must yield to emergency vehicles, you should move to the left OR right depending on the situation. On one-way streets, moving right may be appropriate. The key is to not obstruct the emergency vehicle's path."

3. Q: "On roads with a speed limit of 60 km/h or higher, the minimum safe following distance should be calculated as the speed in km/h minus 15 meters."
   A: FALSE
   E: "Safe following distance depends on road conditions, weather, and vehicle type. The general rule is to maintain a 2-3 second gap, not a fixed formula. This varies with conditions."

4. Q: "Mopeds (原動機付自転車) with engine displacement of 50cc or less must travel in the leftmost lane on roads with multiple lanes."
   A: TRUE
   E: "Mopeds under 50cc must stay in the leftmost portion of the leftmost lane unless turning right, where two-stage right turns (二段階右折) may be required at certain intersections."

5. Q: "Parking is prohibited within 5 meters of a fire hydrant (消火栓)."
   A: TRUE
   E: "Article 45 prohibits parking within 5 meters of fire hydrants, fire station entrances, and fire alarm boxes to ensure emergency access."`;

    // Call Gemini API for text generation
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
      "needs_image": ${roadSignImage ? 'true' : 'false'},
      "image_description": "${roadSignImage ? `Road sign: ${roadSignImage.sign_name_en || 'Unknown sign'}` : 'Description of traffic sign or situation if needs_image is true'}",
      "image_url": "${roadSignImage ? roadSignImage.storage_url : ''}"
    }
  ]
}

${roadSignImage ? `IMPORTANT: All questions must reference the provided road sign image. Set needs_image to true and include the image_url: ${roadSignImage.storage_url}` : 'Set needs_image to true for questions about road signs, traffic signals, or visual scenarios. Provide a clear image_description.'}
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

    // Generate images for questions that need them (or use provided road sign image)
    const questionsWithImages = await Promise.all(
      questions.map(async (q: any) => {
        let figureUrl = null;

        // Use road sign image if provided
        if (roadSignImage && q.needs_image) {
          figureUrl = roadSignImage.storage_url;
        } else if (q.needs_image && q.image_url) {
          // Use image_url from AI response if available
          figureUrl = q.image_url;
        } else if (q.needs_image && q.image_description) {
          // Strategy 1: Try Wikimedia Commons database first
          try {
            // Extract category from image description or question
            const extractCategory = (desc: string): string | null => {
              const lower = desc.toLowerCase();
              if (lower.includes('warning') || lower.includes('caution')) return 'warning';
              if (lower.includes('regulatory') || lower.includes('prohibition')) return 'regulatory';
              if (lower.includes('instruction') || lower.includes('indication')) return 'indication';
              if (lower.includes('guidance') || lower.includes('information')) return 'guidance';
              if (lower.includes('auxiliary')) return 'auxiliary';
              if (lower.includes('marking')) return 'road-markings';
              return null;
            };
            
            const category = extractCategory(q.image_description);
      const wikimediaImage = await findWikimediaImage(supabase as any, category, q.image_description);
      
      if (wikimediaImage) {
        await incrementImageUsage(supabase as any, wikimediaImage.id);
              figureUrl = wikimediaImage.storage_url;
              console.log(`Using Wikimedia Commons image for question: ${q.image_description}`);
            }
          } catch (wikiError) {
            console.error('Error looking up Wikimedia image:', wikiError);
          }
          
          // Strategy 2: Fallback to AI image generation if Wikimedia not found
          if (!figureUrl && LOVABLE_API_KEY) {
            try {
              const imagePrompt = `Generate a clear, simple illustration of: ${q.image_description}. Style: Clean vector graphic suitable for a driving test, high contrast, educational.`;
              
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
                const generatedUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
                if (generatedUrl) {
                  figureUrl = generatedUrl;
                  console.log(`Using AI-generated image for question: ${q.image_description}`);
                }
              }
            } catch (imgError) {
              console.error('Error generating image:', imgError);
            }
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

    // Also save to road_sign_questions table if road_sign_image_id is provided
    if (roadSignImage && questionsWithImages.length > 0) {
      const roadSignQuestions = questionsWithImages.map((q: any) => ({
        road_sign_image_id: road_sign_image_id,
        question_text: q.question,
        answer: q.answer,
        explanation: q.explanation,
        difficulty: q.difficulty_level || difficulty || 'medium',
      }));

      const { error: roadSignError } = await supabase
        .from('road_sign_questions')
        .insert(roadSignQuestions);

      if (roadSignError) {
        console.error('Error inserting road sign questions:', roadSignError);
      }
    }

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
