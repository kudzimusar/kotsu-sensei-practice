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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
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

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
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
      "difficulty_level": "medium"
    }
  ]
}

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

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Store questions in database
    const questionsToInsert = questions.map((q: any) => ({
      question: q.question,
      answer: q.answer,
      explanation: q.explanation,
      test_category: category || 'general',
      difficulty_level: q.difficulty_level || difficulty || 'medium',
      source_concept: q.source_concept || concept,
      language: language || 'en',
      status: 'pending'
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
