import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { corsHeaders } from "../_shared/cors.ts";
import { findWikimediaImage, mapFlashcardCategoryToDbCategory, incrementImageUsage } from "../_shared/wikimedia-image-lookup.ts";

// Detect if user question needs visual aid
function needsVisualAid(userMessage: string): boolean {
  const visualKeywords = [
    'sign', 'signal', 'marking', 'symbol', 'arrow',
    'traffic light', 'pedestrian crossing', 'zebra crossing',
    'road marking', 'lane', 'intersection marking',
    'stop sign', 'yield sign', 'speed limit', 'no parking',
    'what does', 'show me', 'how does', 'looks like', 'look like'
  ];
  
  const lowercaseMessage = userMessage.toLowerCase();
  return visualKeywords.some(keyword => lowercaseMessage.includes(keyword));
}

// Fetch image with metadata (tries Wikimedia Commons first, then Serper)
async function fetchImageWithMetadata(
  supabase: ReturnType<typeof createClient>,
  query: string,
  category?: string | null
): Promise<{
  image: string | null;
  attribution?: string;
  imageSource?: string;
  wikimediaPageUrl?: string;
  licenseInfo?: string;
} | null> {
  // Strategy 1: Try Wikimedia Commons database first
  const dbCategory = category ? mapFlashcardCategoryToDbCategory(category) : null;
  const wikimediaImage = await findWikimediaImage(supabase, dbCategory, query);
  
  if (wikimediaImage) {
    await incrementImageUsage(supabase, wikimediaImage.id);
    
    // Fetch full metadata
    const { data: fullMetadata } = await (supabase as any)
      .from('road_sign_images')
      .select('attribution_text, license_info, wikimedia_page_url, image_source')
      .eq('id', wikimediaImage.id)
      .single();
    
    console.log(`Using Wikimedia Commons image for: ${query}`);
    return {
      image: wikimediaImage.storage_url,
      attribution: (fullMetadata as any)?.attribution_text || undefined,
      imageSource: (fullMetadata as any)?.image_source || 'wikimedia_commons',
      wikimediaPageUrl: (fullMetadata as any)?.wikimedia_page_url || undefined,
      licenseInfo: (fullMetadata as any)?.license_info || undefined,
    };
  }

  // Strategy 2: Fallback to Serper API
  try {
    const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY');
    
    if (!SERPER_API_KEY) {
      console.log('SERPER_API_KEY not configured, skipping image search');
      return { image: null };
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
      return { image: null };
    }

    const data = await response.json();
    const imageUrl = data.images?.[0]?.imageUrl || null;
    
    if (imageUrl) {
      console.log(`Using Serper API image for: ${query}`);
      return {
        image: imageUrl,
        imageSource: 'serper'
      };
    }
    
    return { image: null };
  } catch (error) {
    console.error('Error fetching image:', error);
    return { image: null };
  }
}

// Fetch images for multiple sections with metadata
async function fetchImagesForSections(
  supabase: ReturnType<typeof createClient>,
  sections: any[]
): Promise<any[]> {
  const promises = sections.map(async (section) => {
    if (section.imageQuery) {
      const imageData = await fetchImageWithMetadata(supabase, section.imageQuery);
      if (imageData && imageData.image) {
        return {
          ...section,
          image: imageData.image,
          attribution: imageData.attribution,
          imageSource: imageData.imageSource,
          wikimediaPageUrl: imageData.wikimediaPageUrl,
          licenseInfo: imageData.licenseInfo,
        };
      }
    }
    return section;
  });
  
  return await Promise.all(promises);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const GOOGLE_AI_STUDIO_API_KEY = Deno.env.get("GOOGLE_AI_STUDIO_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    // Use GOOGLE_AI_STUDIO_API_KEY as primary fallback, then GEMINI_API_KEY
    const fallbackApiKey = GOOGLE_AI_STUDIO_API_KEY || GEMINI_API_KEY;
    
    console.log('AI Chat request received with', messages.length, 'messages');
    console.log('API Keys available: LOVABLE=', !!LOVABLE_API_KEY, 'GOOGLE_AI_STUDIO=', !!GOOGLE_AI_STUDIO_API_KEY, 'GEMINI=', !!GEMINI_API_KEY);
    
    if (!LOVABLE_API_KEY && !fallbackApiKey) {
      throw new Error("Neither LOVABLE_API_KEY nor GOOGLE_AI_STUDIO_API_KEY/GEMINI_API_KEY is configured");
    }

    // Create Supabase client for image lookups
    let supabase: ReturnType<typeof createClient> | null = null;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }

    const systemPrompt = `You are a friendly and knowledgeable Japanese driving instructor assistant named "Kōtsū Sensei" (交通先生). Your role is to help students understand Japanese traffic laws, road signs, driving techniques, and test preparation.

CRITICAL RESPONSE FORMAT:
When users ask about visual topics (signs, markings, signals), you MUST respond with a JSON structure containing sections. Each section should have:
- heading: A clear H3-level heading for the topic
- imageQuery: A specific search term for fetching a relevant image (e.g., "stop sign japan", "speed limit 50 sign japan")
- content: The explanation in markdown format
- summary: (optional) A key takeaway or tip

Example JSON structure:
{
  "sections": [
    {
      "heading": "Stop Sign (一時停止 - Ichiji Teishi)",
      "imageQuery": "stop sign japan road",
      "content": "The stop sign is red and octagonal with white text...\\n\\n**Key Points:**\\n- Must come to complete stop\\n- Check all directions",
      "summary": "Always stop completely at stop signs, even if the road appears clear."
    }
  ]
}

For non-visual topics, you can respond with plain text as normal.

Guidelines:
- Structure responses into clear sections with specific image queries
- Each section should cover one main topic
- Use descriptive imageQuery terms (include "japan" and specific sign/marking names)
- Keep content concise but thorough with markdown formatting
- Add summaries for important safety tips or key takeaways
- Be encouraging and supportive
- Reference specific Japanese traffic rules

Topics you can help with:
- Japanese traffic laws and regulations
- Road signs and their meanings
- Right-of-way rules
- Speed limits and parking regulations
- Driving techniques and best practices
- Test preparation strategies
- Common mistakes to avoid`;

    let response: Response;
    let assistantMessage: string | null = null;
    let useFallback = false;

    if (LOVABLE_API_KEY) {
      try {
        console.log("Attempting primary API (LOVABLE_API_KEY)");
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
              ...messages.map((msg: any) => ({
                role: msg.role,
                content: msg.content || '',
              })),
            ],
            stream: false,
          }),
        });

        if (!response.ok) {
          let errorText = '';
          try {
            errorText = await response.text();
          } catch (e) {
            errorText = `Failed to read error response: ${e instanceof Error ? e.message : 'Unknown'}`;
          }
          console.error("Primary API error:", response.status, errorText.substring(0, 200));
          throw new Error(`Primary API error: ${response.status} - ${errorText.substring(0, 100)}`);
        }

        let data: any;
        try {
          data = await response.json();
        } catch (e) {
          console.error("Failed to parse primary API response:", e);
          throw new Error(`Primary API returned invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
        
        assistantMessage = data.choices?.[0]?.message?.content;
        
        if (!assistantMessage) {
          console.error("Primary API returned empty response:", JSON.stringify(data));
          throw new Error("Primary API returned empty response");
        }
        
        console.log("Primary API succeeded, response length:", assistantMessage.length);
      } catch (error) {
        console.warn("LOVABLE_API_KEY failed, trying fallback:", error);
        useFallback = true;
        assistantMessage = null;
      }
    } else {
      console.log("LOVABLE_API_KEY not available, using fallback");
      useFallback = true;
    }

    // Fallback to GOOGLE_AI_STUDIO_API_KEY or GEMINI_API_KEY
    if (useFallback && fallbackApiKey) {
      console.log("Using GOOGLE_AI_STUDIO_API_KEY/GEMINI_API_KEY fallback");
      try {
        // Build messages for Gemini API format
        const conversationHistory: any[] = [];
        
        // Add system prompt as first user message
        conversationHistory.push({
          role: "user",
          parts: [{ text: systemPrompt }]
        });
        
        // Add conversation history
        for (const msg of messages) {
          if (msg.role === "assistant") {
            conversationHistory.push({
              role: "model",
              parts: [{ text: msg.content || "" }]
            });
          } else {
            conversationHistory.push({
              role: "user",
              parts: [{ text: msg.content || "" }]
            });
          }
        }

        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${fallbackApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: conversationHistory,
              generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json"
              }
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Fallback API error:", response.status, errorText.substring(0, 200));
          throw new Error(`Fallback API error: ${response.status}`);
        }

        const data = await response.json();
        assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        
        if (!assistantMessage) {
          throw new Error("Fallback API returned empty response");
        }
        
        console.log("Fallback API succeeded, response length:", assistantMessage.length);
      } catch (error) {
        console.error("Fallback API also failed:", error);
        throw new Error("All API methods failed");
      }
    }

    if (!assistantMessage) {
      throw new Error("No response from AI");
    }

    console.log('AI Chat response generated successfully');

    // Try to parse as structured JSON response
    let parsedResponse: any = null;
    try {
      // First, try to extract JSON from markdown code blocks if present
      let jsonString = assistantMessage;
      
      // Remove markdown code blocks (```json ... ``` or ``` ... ```)
      const codeBlockMatch = assistantMessage.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
      }
      
      // Try to find JSON object even if there's text before/after
      const jsonMatch = jsonString.match(/\{[\s\S]*"sections"[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
      
      parsedResponse = JSON.parse(jsonString.trim());
      console.log('Successfully parsed structured JSON response');
    } catch (e) {
      console.log('Response is plain text, not JSON structured:', e instanceof Error ? e.message : 'Parse error');
    }

    // If structured response with sections, fetch images for each section
    if (parsedResponse && parsedResponse.sections && Array.isArray(parsedResponse.sections)) {
      console.log(`Processing ${parsedResponse.sections.length} sections with images...`);
      
      if (supabase) {
        const sectionsWithImages = await fetchImagesForSections(supabase, parsedResponse.sections);
        
        return new Response(
          JSON.stringify({ 
            sections: sectionsWithImages
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        // No Supabase client available, return sections without images
        console.warn('Supabase client not available, returning sections without images');
        return new Response(
          JSON.stringify({ 
            sections: parsedResponse.sections
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Plain text response (backward compatibility)
    return new Response(
      JSON.stringify({ 
        message: assistantMessage
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
