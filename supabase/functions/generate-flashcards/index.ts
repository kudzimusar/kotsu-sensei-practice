import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { corsHeaders } from "../_shared/cors.ts";
import { mapFlashcardCategoryToDbCategory } from "../_shared/wikimedia-image-lookup.ts";
import { fetchEnhancedImage } from "../_shared/enhanced-image-fetcher.ts";

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
      
      // Map category to sign_category (store for later use)
      const signCategory = mapFlashcardCategoryToDbCategory(category) || category;
      const dbCategory = signCategory; // Use this for image fetching later
      
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
        const existing = flashcards.find(f => f && f.imageQuery === query);
        if (existing) return existing;
      
        return {
          imageQuery: query,
          question: `What does this ${categoryInfo.name.toLowerCase()} mean?`,
          answer: `This is a Japanese ${categoryInfo.name.toLowerCase()}. See explanation.`,
          explanation: `This sign/marking indicates important traffic information. Study this carefully for your driving test.`
        };
      });
    }
    
    // Ensure all flashcards have required fields
    flashcards = flashcards.filter(f => f && f.question && f.answer).map(f => ({
      ...f,
      imageQuery: f.imageQuery || '',
      question: f.question || 'What does this sign mean?',
      answer: f.answer || 'Unknown',
      explanation: f.explanation || 'No explanation available'
    }));

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
    
    // Fetch distractors for generating options
    const dbCategoryForDistractors = category ? mapFlashcardCategoryToDbCategory(category) : null;
    let allDistractors: any[] = [];
    try {
      const { data: distractorsData, error: distractorsError } = await supabaseForImages
        .from('road_sign_images')
        .select('sign_name_en, sign_name_jp, sign_category')
        .eq('is_verified', true)
        .limit(50);
      
      if (!distractorsError && distractorsData) {
        allDistractors = distractorsData;
      }
    } catch (error) {
      console.error('Error fetching distractors:', error);
      // Continue with empty array
    }

    const flashcardsWithImages = await Promise.all(
      flashcards.map(async (flashcard, index) => {
        try {
          // Ensure flashcard has required fields
          if (!flashcard || !flashcard.question || !flashcard.answer) {
            console.error('Invalid flashcard at index', index, flashcard);
            return null;
          }

          // Use recycled image if available
          if (recycledImages[index]) {
            const recycledImg = recycledImages[index];
            
            // Ensure we have a sign name
            if (!recycledImg.sign_name_en) {
              console.error('Recycled image missing sign_name_en at index', index);
              // Fall through to regular image fetching
            } else {
              // Get distractors from same category
              const categoryDistractors = (allDistractors || [])
                .filter((d: any) => d.sign_category === recycledImg.sign_category && d.sign_name_en && d.sign_name_en !== recycledImg.sign_name_en)
                .map((d: any) => d.sign_name_en)
                .filter(Boolean)
                .slice(0, 3);

              // Build options array
              const options = [
                recycledImg.sign_name_en,
                ...categoryDistractors
              ]
                .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
                .sort(() => Math.random() - 0.5) // Shuffle
                .slice(0, 4); // Max 4 options

              // Ensure correct answer is in options
              if (!options.includes(recycledImg.sign_name_en)) {
                options[0] = recycledImg.sign_name_en;
              }

              return {
                ...flashcard,
                imageUrl: recycledImg.storage_url || null,
                roadSignImageId: recycledImg.id,
                correct_answer: recycledImg.sign_name_en,
                options: options.length > 0 ? options : [recycledImg.sign_name_en],
                difficulty: 'easy',
                // Include metadata for Wikimedia Commons images
                signNameEn: recycledImg.sign_name_en || null,
                signNameJp: recycledImg.sign_name_jp || null,
                signCategory: recycledImg.sign_category || null,
                attributionText: recycledImg.attribution_text || null,
                licenseInfo: recycledImg.license_info || null,
                wikimediaPageUrl: recycledImg.wikimedia_page_url || null,
                artistName: recycledImg.artist_name || null,
                imageSource: recycledImg.image_source || null,
              };
            }
          }
        
        // Use enhanced image fetcher for better image retrieval
        let imageResult = null;
        try {
          if (flashcard.imageQuery) {
            const dbCategoryForImage = category ? mapFlashcardCategoryToDbCategory(category) : null;
            imageResult = await fetchEnhancedImage(
              supabaseForImages,
              flashcard.imageQuery,
              dbCategoryForImage
            );
          }
        } catch (imageError) {
          console.error(`Error fetching image for ${flashcard.imageQuery}:`, imageError);
          // Continue without image
        }

        if (imageResult) {
          // Get distractors from same category
          const categoryDistractors = (allDistractors || [])
            .filter((d: any) => d.sign_category === imageResult.signCategory && d.sign_name_en !== imageResult.signNameEn)
            .map((d: any) => d.sign_name_en)
            .filter(Boolean)
            .slice(0, 3);

          // Build options array
          const options = [
            imageResult.signNameEn || flashcard.answer,
            ...categoryDistractors
          ]
            .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
            .sort(() => Math.random() - 0.5) // Shuffle
            .slice(0, 4); // Max 4 options

          // Ensure correct answer is in options
          const correctAnswer = imageResult.signNameEn || flashcard.answer;
          if (!options.includes(correctAnswer)) {
            options[0] = correctAnswer;
          }

          return {
            ...flashcard,
            imageUrl: imageResult.imageUrl,
            roadSignImageId: imageResult.signId,
            correct_answer: correctAnswer,
            options: options,
            difficulty: 'easy',
            signNameEn: imageResult.signNameEn || null,
            signNameJp: imageResult.signNameJp || null,
            signCategory: imageResult.signCategory || null,
            attributionText: imageResult.attributionText || null,
            licenseInfo: imageResult.licenseInfo || null,
            wikimediaPageUrl: imageResult.wikimediaPageUrl || null,
            artistName: imageResult.artistName || null,
            imageSource: imageResult.imageSource || null,
          };
        }
        
          // No image found - still create flashcard with options
          const categoryDistractors = (allDistractors || [])
            .filter((d: any) => !dbCategoryForDistractors || d.sign_category === dbCategoryForDistractors)
            .map((d: any) => d.sign_name_en)
            .filter(Boolean)
            .slice(0, 3);

          const options = [
            flashcard.answer,
            ...categoryDistractors
          ]
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);

          if (!options.includes(flashcard.answer)) {
            options[0] = flashcard.answer;
          }

          return {
            ...flashcard,
            imageUrl: null,
            correct_answer: flashcard.answer,
            options: options.length > 0 ? options : [flashcard.answer],
            difficulty: 'easy'
          };
        } catch (error) {
          console.error(`Error processing flashcard at index ${index}:`, error);
          // Return a basic flashcard even if there's an error
          return {
            ...flashcard,
            imageUrl: null,
            correct_answer: flashcard.answer || 'Unknown',
            options: [flashcard.answer || 'Unknown'],
            difficulty: 'easy'
          };
        }
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
          correct_answer: fc.correct_answer || fc.answer,
          options: fc.options || [],
          explanation: fc.explanation,
          difficulty: fc.difficulty || 'easy',
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

    // Filter out null flashcards
    const validFlashcards = flashcardsWithImages.filter((f: any) => f !== null);
    
    console.log(`Generated ${validFlashcards.length} flashcards with ${validFlashcards.filter((f: any) => f.imageUrl).length} images`);

    return new Response(
      JSON.stringify({ 
        flashcards: validFlashcards,
        category: categoryInfo.name,
        count: validFlashcards.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-flashcards function:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
