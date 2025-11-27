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

    const { 
      category, 
      count = 20, 
      difficulty = "easy",
      userId = null,
      adaptive = false // If true, use user's weak areas
    } = await req.json();

    let signIds: string[] = [];

    if (adaptive && userId) {
      // Get user's weak areas
      const { data: weakAreas, error: weakError } = await supabase
        .rpc('get_user_weak_areas', { 
          p_user_id: userId,
          p_limit: count 
        });

      if (!weakError && weakAreas && weakAreas.length > 0) {
        // Get flashcard IDs and fetch their sign IDs
        const flashcardIds = weakAreas.map((w: any) => w.flashcard_id);
        const { data: flashcards } = await supabase
          .from("road_sign_flashcards")
          .select("road_sign_image_id")
          .in("id", flashcardIds);

        if (flashcards) {
          signIds = flashcards.map((f: any) => f.road_sign_image_id).filter(Boolean);
        }
      }
    }

    // If no adaptive results or not using adaptive, get random signs
    if (signIds.length === 0) {
      let query = supabase
        .from("road_sign_images")
        .select("id")
        .eq("is_verified", true);

      if (category) {
        // Map flashcard category to database category
        const categoryMap: { [key: string]: string } = {
          'regulatory-signs': 'regulatory',
          'warning-signs': 'warning',
          'indication-signs': 'indication',
          'guidance-signs': 'guidance',
          'auxiliary-signs': 'auxiliary',
          'road-markings': 'road-markings',
        };
        const dbCategory = categoryMap[category] || category;
        query = query.eq("sign_category", dbCategory);
      }

      const { data: signs } = await query
        .limit(count * 2) // Get more to randomize
        .order("usage_count", { ascending: false });

      if (signs) {
        // Randomize and take requested count
        signIds = signs
          .sort(() => Math.random() - 0.5)
          .slice(0, count)
          .map((s) => s.id);
      }
    }

    // Generate flashcards for each sign using the generate-flashcard function
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const flashcards = await Promise.all(
      signIds.map(async (signId) => {
        try {
          const response = await fetch(
            `${SUPABASE_URL}/functions/v1/generate-flashcard`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
              },
              body: JSON.stringify({ signId, difficulty })
            }
          );

          if (response.ok) {
            return await response.json();
          }
          return null;
        } catch (error) {
          console.error(`Error generating flashcard for ${signId}:`, error);
          return null;
        }
      })
    );

    const validFlashcards = flashcards.filter((f) => f !== null);

    return new Response(
      JSON.stringify({
        flashcards: validFlashcards,
        count: validFlashcards.length,
        category: category || "all",
        difficulty,
        adaptive
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating flashcard deck:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

