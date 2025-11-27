import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { signId, difficulty = "easy" } = await req.json();

    if (!signId) {
      return new Response(
        JSON.stringify({ error: "signId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch full sign metadata
    const { data: sign, error: signError } = await supabase
      .from("road_sign_images")
      .select(`
        id,
        sign_name_en,
        sign_name_jp,
        sign_number,
        sign_category,
        tags,
        file_name,
        storage_url,
        sign_meaning,
        ai_explanation
      `)
      .eq("id", signId)
      .single();

    if (!sign || signError) {
      return new Response(
        JSON.stringify({ error: "Sign not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch distractors (similar category, different sign)
    const { data: distractors } = await supabase
      .from("road_sign_images")
      .select("sign_name_en, sign_name_jp")
      .eq("sign_category", sign.sign_category)
      .neq("id", sign.id)
      .eq("is_verified", true)
      .limit(5);

    // Build options array
    const options = [
      sign.sign_name_en,
      ...(distractors?.map((d) => d.sign_name_en).filter(Boolean) || [])
    ]
      .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, 4); // Ensure max 4 options

    // Ensure correct answer is in options
    if (!options.includes(sign.sign_name_en)) {
      options[0] = sign.sign_name_en;
    }

    // Compose question
    const question = `What does this road sign mean?`;

    // Compose explanation
    const explanation = sign.ai_explanation || 
      sign.sign_meaning || 
      `${sign.sign_name_en}${sign.sign_name_jp ? ` (${sign.sign_name_jp})` : ''} is a ${sign.sign_category} sign${sign.sign_number ? ` identified by sign number ${sign.sign_number}` : ''}.`;

    // Check if flashcard already exists
    const { data: existingFlashcard } = await supabase
      .from("road_sign_flashcards")
      .select("*")
      .eq("road_sign_image_id", sign.id)
      .eq("difficulty", difficulty)
      .single();

    let flashcard;

    if (existingFlashcard) {
      // Update existing flashcard
      const { data: updated, error: updateError } = await supabase
        .from("road_sign_flashcards")
        .update({
          question,
          correct_answer: sign.sign_name_en,
          options,
          explanation,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingFlashcard.id)
        .select("*")
        .single();

      if (updateError) throw updateError;
      flashcard = updated;
    } else {
      // Insert new flashcard
      const { data: inserted, error: insertError } = await supabase
        .from("road_sign_flashcards")
        .insert({
          road_sign_image_id: sign.id,
          question,
          correct_answer: sign.sign_name_en,
          options,
          explanation,
          difficulty,
          category: sign.sign_category
        })
        .select("*")
        .single();

      if (insertError) throw insertError;
      flashcard = inserted;
    }

    // Return flashcard with image URL
    return new Response(
      JSON.stringify({
        ...flashcard,
        imageUrl: sign.storage_url,
        signNameEn: sign.sign_name_en,
        signNameJp: sign.sign_name_jp,
        signCategory: sign.sign_category
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating flashcard:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

