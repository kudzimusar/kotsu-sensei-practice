import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { corsHeaders } from "../_shared/cors.ts";
import { findWikimediaImage, mapFlashcardCategoryToDbCategory, incrementImageUsage } from "../_shared/wikimedia-image-lookup.ts";

// Fetch a single image - tries Wikimedia Commons first, then Serper API as fallback
async function fetchImage(
  supabase: ReturnType<typeof createClient>,
  query: string,
  category?: string | null
): Promise<string | null> {
  // Strategy 1: Try Wikimedia Commons database first
  const dbCategory = category ? mapFlashcardCategoryToDbCategory(category) : null;
  const wikimediaImage = await findWikimediaImage(supabase, dbCategory, query);
  
  if (wikimediaImage) {
    // Increment usage count
    await incrementImageUsage(supabase, wikimediaImage.id);
    console.log(`Using Wikimedia Commons image for: ${query}`);
    return wikimediaImage.storage_url;
  }

  // Strategy 2: Fallback to Serper API
  try {
    const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY');
    
    if (!SERPER_API_KEY) {
      console.log('SERPER_API_KEY not configured, skipping image search');
      return null;
    }

    const response = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: `${query} japan driving traffic road`,
        num: 1
      })
    });

    if (!response.ok) {
      console.error('Serper API error:', response.status);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.images?.[0]?.imageUrl || null;
    
    if (imageUrl) {
      console.log(`Using Serper API image for: ${query}`);
    }
    
    return imageUrl;
  } catch (error) {
    console.error('Error fetching image from Serper:', error);
    return null;
  }
}

// Flashcard categories with their Japanese names and queries
const FLASHCARD_CATEGORIES = {
  'road-signs': {
    name: 'Road Signs (標識)',
    description: 'Traffic signs and regulatory signs',
    queries: [
      'stop sign japan',
      'yield sign japan',
      'speed limit sign japan',
      'no entry sign japan',
      'no parking sign japan',
      'one way sign japan',
      'pedestrian crossing sign japan',
      'school zone sign japan',
      'no U-turn sign japan',
      'no right turn sign japan',
      'no left turn sign japan',
      'priority road sign japan',
      'roundabout sign japan',
      'intersection sign japan',
      'railway crossing sign japan'
    ]
  },
  'road-markings': {
    name: 'Road Markings (道路標示)',
    description: 'Pavement markings and lane indicators',
    queries: [
      'zebra crossing japan',
      'stop line marking japan',
      'lane divider japan',
      'arrow marking japan',
      'yield line japan',
      'bike lane marking japan',
      'bus lane marking japan',
      'crosswalk marking japan'
    ]
  },
  'traffic-signals': {
    name: 'Traffic Signals (信号機)',
    description: 'Traffic lights and signal meanings',
    queries: [
      'traffic light japan',
      'red light japan',
      'yellow light japan',
      'green arrow signal japan',
      'flashing signal japan'
    ]
  },
  'warning-signs': {
    name: 'Warning Signs (警戒標識)',
    description: 'Warning and caution signs',
    queries: [
      'curve warning sign japan',
      'slippery road sign japan',
      'falling rocks sign japan',
      'children crossing sign japan',
      'wildlife crossing sign japan',
      'road work sign japan'
    ]
  },
  'prohibition-signs': {
    name: 'Prohibition Signs (禁止標識)',
    description: 'Signs indicating restrictions',
    queries: [
      'no entry sign japan',
      'no parking sign japan',
      'no stopping sign japan',
      'no vehicles sign japan',
      'weight limit sign japan',
      'height limit sign japan'
    ]
  },
  'instruction-signs': {
    name: 'Instruction Signs (指示標識)',
    description: 'Directional and informational signs',
    queries: [
      'direction sign japan',
      'parking sign japan',
      'hospital sign japan',
      'gas station sign japan',
      'rest area sign japan'
    ]
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, count = 10 } = await req.json();
    
    // Create Supabase client for database queries
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    let recycledImages: any[] = [];
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      
      // Map category to sign_category
      const signCategory = mapFlashcardCategoryToDbCategory(category) || category;
      
      // Try to find Wikimedia Commons images first, then other verified images
      // Query wikimedia_commons images first
      const { data: wikimediaImages, error: wikiError } = await supabase
        .from('road_sign_images')
        .select('*')
        .eq('sign_category', signCategory)
        .eq('is_verified', true)
        .eq('image_source', 'wikimedia_commons')
        .order('usage_count', { ascending: false })
        .limit(count);
      
      let signImages = wikimediaImages || [];
      
      // If we need more images, get other verified images
      if (signImages.length < count) {
        const { data: otherImages, error: otherError } = await supabase
          .from('road_sign_images')
          .select('*')
          .eq('sign_category', signCategory)
          .eq('is_verified', true)
          .neq('image_source', 'wikimedia_commons')
          .order('usage_count', { ascending: false })
          .limit(count - signImages.length);
        
        if (!otherError && otherImages) {
          signImages = [...signImages, ...otherImages];
        }
      }
      
      const signError = wikiError;
      
      if (!signError && signImages && signImages.length > 0) {
        recycledImages = signImages;
        console.log(`Found ${recycledImages.length} images for category ${category} (${recycledImages.filter(img => img.image_source === 'wikimedia_commons').length} from Wikimedia Commons)`);
      }
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_AI_STUDIO_API_KEY = Deno.env.get("GOOGLE_AI_STUDIO_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    // Use GOOGLE_AI_STUDIO_API_KEY as primary, then LOVABLE_API_KEY, then GEMINI_API_KEY
    const apiKey = GOOGLE_AI_STUDIO_API_KEY || LOVABLE_API_KEY || GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("No API key configured. Please set GOOGLE_AI_STUDIO_API_KEY, LOVABLE_API_KEY, or GEMINI_API_KEY");
    }
    
    console.log('API Keys available: GOOGLE_AI_STUDIO=', !!GOOGLE_AI_STUDIO_API_KEY, 'LOVABLE=', !!LOVABLE_API_KEY, 'GEMINI=', !!GEMINI_API_KEY);

    console.log(`Generating ${count} flashcards for category: ${category}`);

    // Get category info
    const categoryInfo = FLASHCARD_CATEGORIES[category as keyof typeof FLASHCARD_CATEGORIES] as typeof FLASHCARD_CATEGORIES[keyof typeof FLASHCARD_CATEGORIES] | undefined;
    if (!categoryInfo) {
      throw new Error(`Invalid category: ${category}`);
    }

    // If we have recycled images, use them; otherwise use queries
    let selectedQueries: string[] = [];
    let requestedCount = count;
    
    if (recycledImages.length > 0) {
      // Use recycled images - create queries from sign names
      selectedQueries = recycledImages.slice(0, Math.min(count, recycledImages.length)).map((img: any) => {
        return `${img.sign_name_en || 'road sign'} japan`;
      });
      requestedCount = selectedQueries.length;
    } else {
      // Select random queries from the category
      const availableQueries = [...categoryInfo.queries];
      requestedCount = Math.min(count, availableQueries.length);
      
      for (let i = 0; i < requestedCount; i++) {
        const randomIndex = Math.floor(Math.random() * availableQueries.length);
        selectedQueries.push(availableQueries.splice(randomIndex, 1)[0]);
      }
    }

    // Generate flashcards using AI
    const systemPrompt = `You are an expert Japanese driving instructor. Generate flashcards for practicing Japanese road signs, markings, and traffic symbols.

For each flashcard, provide:
1. A clear question asking what the sign/marking means or what action should be taken
2. A concise answer explaining the sign/marking meaning
3. A brief explanation with key points

Category: ${categoryInfo.name}
Description: ${categoryInfo.description}

Generate ${requestedCount} flashcards in this exact JSON format:
{
  "flashcards": [
    {
      "imageQuery": "stop sign japan",
      "question": "What does this sign mean?",
      "answer": "Stop (一時停止 - Ichiji Teishi). Must come to a complete stop.",
      "explanation": "This red octagonal sign with white text means you must come to a complete stop before proceeding. Check all directions before continuing."
    }
  ]
}

Make sure:
- Each imageQuery matches the provided query exactly
- Questions are clear and test understanding
- Answers include both English and Japanese (when relevant)
- Explanations are educational and concise
- Return valid JSON only, no additional text.`;

    // Try LOVABLE_API_KEY first (gateway), then direct Google AI Studio API
    let response;
    let useDirectApi = false;
    
    if (LOVABLE_API_KEY) {
      console.log("Using LOVABLE_API_KEY (gateway)");
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { 
              role: "user", 
              content: `Generate ${requestedCount} flashcards with these image queries: ${selectedQueries.join(', ')}. Return only valid JSON.` 
            },
          ],
          stream: false,
        }),
      });
    } else if (GOOGLE_AI_STUDIO_API_KEY || GEMINI_API_KEY) {
      console.log("Using Google AI Studio API directly");
      useDirectApi = true;
      const directApiKey = GOOGLE_AI_STUDIO_API_KEY || GEMINI_API_KEY;
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${directApiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `${systemPrompt}\n\nUser: Generate ${requestedCount} flashcards with these image queries: ${selectedQueries.join(', ')}. Return only valid JSON.` }
            ]
          }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        }),
      });
    } else {
      throw new Error("No API key available");
    }

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Google AI rate limit exceeded. Free tier allows 15 requests/minute. Please try again shortly." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 403) {
        return new Response(
          JSON.stringify({ error: "Invalid API key or quota exceeded. Please check your Google AI Studio configuration." }), 
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("Google AI Studio error:", response.status, errorText);
      throw new Error(`Google AI Studio error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    let assistantMessage: string;
    if (useDirectApi) {
      // Google AI Studio direct API format
      assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!assistantMessage) {
        console.error("Google AI Studio API response:", JSON.stringify(data, null, 2));
        throw new Error("No response from Google AI Studio API");
      }
    } else {
      // Lovable gateway format
      assistantMessage = data.choices?.[0]?.message?.content || "";
      if (!assistantMessage) {
        throw new Error("No response from AI");
      }
    }

    console.log('AI flashcard response generated successfully');

    // Parse JSON response
    let flashcards: any[] = [];
    try {
      // Extract JSON from markdown code blocks if present
      let jsonString = assistantMessage;
      const codeBlockMatch = assistantMessage.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
      }
      
      // Find JSON object
      const jsonMatch = jsonString.match(/\{[\s\S]*"flashcards"[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0].trim());
        flashcards = parsedResponse.flashcards || [];
      } else {
        throw new Error('Could not find flashcards in response');
      }
    } catch (e) {
      console.error('Error parsing flashcard response:', e);
      throw new Error('Failed to parse flashcard response');
    }

    // Ensure we match the queries - create flashcards manually if needed
    if (flashcards.length !== selectedQueries.length) {
      console.log('Regenerating flashcards to match queries...');
      flashcards = selectedQueries.map((query, index) => {
        // Find matching flashcard or create default
        const existing = flashcards.find(f => f.imageQuery === query);
        if (existing) return existing;
      
      return {
          imageQuery: query,
          question: `What does this ${categoryInfo.name.toLowerCase()} mean?`,
          answer: `This is a Japanese ${categoryInfo.name.toLowerCase()}. See explanation.`,
          explanation: `This sign/marking indicates important traffic information. Study this carefully for your driving test.`
      };
    });
    }

    // Fetch images for each flashcard (use recycled images if available)
    console.log(`Processing ${flashcards.length} flashcards...`);
    
    // Ensure we have a supabase client for image fetching
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }
    const supabaseForImages = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    const flashcardsWithImages = await Promise.all(
      flashcards.map(async (flashcard, index) => {
        // Use recycled image if available
        if (recycledImages[index]) {
          const recycledImg = recycledImages[index];
          // Increment usage count
          await incrementImageUsage(supabaseForImages, recycledImg.id);
          return {
            ...flashcard,
            imageUrl: recycledImg.storage_url,
            roadSignImageId: recycledImg.id,
          };
        }
        
        // Otherwise try Wikimedia Commons first, then Serper fallback
        const imageUrl = await fetchImage(supabaseForImages, flashcard.imageQuery, category);
        return {
          ...flashcard,
          imageUrl: imageUrl || null
        };
      })
    );
    
    // Save flashcards to database if we used recycled images
    if (recycledImages.length > 0 && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      
      const flashcardsToInsert = flashcardsWithImages
        .filter((fc: any) => fc.roadSignImageId)
        .map((fc: any) => ({
          road_sign_image_id: fc.roadSignImageId,
          question: fc.question,
          answer: fc.answer,
          explanation: fc.explanation,
          category: category,
        }));
      
      if (flashcardsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('road_sign_flashcards')
          .insert(flashcardsToInsert);
        
        if (insertError) {
          console.error('Error saving flashcards to database:', insertError);
        }
      }
    }

    console.log(`Generated ${flashcardsWithImages.length} flashcards with ${flashcardsWithImages.filter(f => f.imageUrl).length} images`);

    return new Response(
      JSON.stringify({ 
        flashcards: flashcardsWithImages,
        category: categoryInfo.name,
        count: flashcardsWithImages.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-flashcards function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
