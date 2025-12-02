import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { findWikimediaImage } from "../_shared/wikimedia-image-lookup.ts";

// CORS headers inline
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

// Intelligent query parsing - maps common terms to sign types
function parseSignQuery(query: string): { searchTerms: string[]; category?: string; signType?: string } {
  const lowerQuery = query.toLowerCase();
  const searchTerms: string[] = [];
  let category: string | undefined;
  let signType: string | undefined;

  // Extract sign type keywords
  if (lowerQuery.includes('stop')) {
    signType = 'stop';
    searchTerms.push('stop', '330', '止まれ', 'tomare', '一時停止');  // 330 is the correct Japanese stop sign number
    category = 'regulatory';
  } else if (lowerQuery.includes('speed limit') || lowerQuery.includes('speed')) {
    signType = 'speed';
    searchTerms.push('speed', 'limit');
    category = 'regulatory';
  } else if (lowerQuery.includes('yield') || lowerQuery.includes('give way')) {
    signType = 'yield';
    searchTerms.push('yield', 'give way');
    category = 'regulatory';
  } else if (lowerQuery.includes('no parking')) {
    signType = 'no parking';
    searchTerms.push('parking', '禁止');
    category = 'regulatory';
  } else if (lowerQuery.includes('no entry')) {
    signType = 'no entry';
    searchTerms.push('entry', '進入禁止');
    category = 'regulatory';
  } else if (lowerQuery.includes('pedestrian') || lowerQuery.includes('crosswalk')) {
    signType = 'pedestrian';
    searchTerms.push('pedestrian', 'crosswalk', '歩行者');
    category = 'warning';
  } else if (lowerQuery.includes('curve') || lowerQuery.includes('bend')) {
    signType = 'curve';
    searchTerms.push('curve', 'bend', 'カーブ');
    category = 'warning';
  } else if (lowerQuery.includes('bus') || lowerQuery.includes('バス')) {
    signType = 'bus';
    searchTerms.push('bus', 'バス', '124');
    category = 'guidance';
  } else if (lowerQuery.includes('railway') || lowerQuery.includes('train')) {
    signType = 'railway';
    searchTerms.push('railway', 'train', '踏切');
    category = 'warning';
  } else if (lowerQuery.includes('school')) {
    signType = 'school';
    searchTerms.push('school', '学校');
    category = 'warning';
  } else if (lowerQuery.includes('hospital')) {
    signType = 'hospital';
    searchTerms.push('hospital', '病院');
    category = 'guidance';
  } else if (lowerQuery.includes('parking')) {
    signType = 'parking';
    searchTerms.push('parking', '駐車');
    category = 'guidance';
  } else if (lowerQuery.includes('steep') || lowerQuery.includes('ascent') || lowerQuery.includes('upgrade') || lowerQuery.includes('急勾配')) {
    signType = 'steep';
    searchTerms.push('steep', 'ascent', 'upgrade', '急勾配', '212-3');  // Fixed: Changed from '328' (horn) to '212-3' (steep ascent)
    category = 'warning';
  } else if (lowerQuery.includes('descent') || lowerQuery.includes('downgrade') || lowerQuery.includes('下り急勾配')) {
    signType = 'steep descent';
    searchTerms.push('descent', 'downgrade', '下り急勾配', '329');
    category = 'warning';
  }

  // Extract other meaningful terms from query
  const words = lowerQuery.split(/\s+/);
  words.forEach(word => {
    if (word.length >= 3 && !['japan', 'japanese', 'road', 'sign', 'the', 'a', 'an', 'this', 'that'].includes(word)) {
      searchTerms.push(word);
    }
  });

  return { searchTerms: [...new Set(searchTerms)], category, signType };
}

// Fetch a single image for a specific query - Serper API FIRST (default), then database fallback
async function fetchImage(
  query: string,
  supabaseClient?: ReturnType<typeof createClient> | null
): Promise<{ 
  imageUrl: string | null; 
  attribution?: string;
  licenseInfo?: string;
  wikimediaPageUrl?: string;
  signNameEn?: string;
  signNameJp?: string;
} | null> {
  console.log(`📸 fetchImage called with query: "${query}"`);
  
  // Strategy 1: Serper API FIRST (default image fetcher)
  try {
    const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY');
    
    if (!SERPER_API_KEY) {
      console.log('SERPER_API_KEY not configured, skipping Serper search');
    } else {
      console.log(`🔍 Using Serper API as default for: "${query}"`);
      
      // Build query to prioritize Wikimedia SVG images
      const serperQuery = `${query} japan road sign filetype:svg site:wikimedia.org OR site:commons.wikimedia.org`;
      
      const response = await fetch('https://google.serper.dev/images', {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: serperQuery,
          num: 10, // Get more results to filter for SVG/Wikimedia
          gl: 'jp', // Japan location bias
          hl: 'en' // English language
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Filter results to prioritize:
        // 1. Wikimedia Commons SVG images
        // 2. Other SVG images
        // 3. Other Wikimedia images
        let imageUrl = null;
        let selectedImage: any = null;
        
        if (data.images && data.images.length > 0) {
          // First, try to find Wikimedia Commons SVG
          const wikimediaSvg = data.images.find((img: any) => 
            img.imageUrl?.endsWith('.svg') && 
            (img.link?.includes('wikimedia.org') || img.link?.includes('commons.wikimedia.org'))
          );
          
          if (wikimediaSvg) {
            imageUrl = wikimediaSvg.imageUrl;
            selectedImage = wikimediaSvg;
            console.log(`✅ Found Wikimedia SVG via Serper API: ${imageUrl}`);
          } else {
            // Try any SVG image
            const anySvg = data.images.find((img: any) => img.imageUrl?.endsWith('.svg'));
            if (anySvg) {
              imageUrl = anySvg.imageUrl;
              selectedImage = anySvg;
              console.log(`✅ Found SVG via Serper API: ${imageUrl}`);
            } else {
              // Try Wikimedia non-SVG
              const wikimediaAny = data.images.find((img: any) => 
                img.link?.includes('wikimedia.org') || img.link?.includes('commons.wikimedia.org')
              );
              if (wikimediaAny) {
                imageUrl = wikimediaAny.imageUrl;
                selectedImage = wikimediaAny;
                console.log(`✅ Found Wikimedia image via Serper API: ${imageUrl}`);
              } else {
                // Fallback to first result
                imageUrl = data.images[0]?.imageUrl || null;
                selectedImage = data.images[0] || null;
                if (imageUrl) {
                  console.log(`✅ Found image via Serper API: ${imageUrl}`);
                }
              }
            }
          }
          
          if (imageUrl) {
            // Extract Wikimedia page URL if available
            const wikimediaPageUrl = selectedImage?.link || undefined;
            
            return { 
              imageUrl,
              wikimediaPageUrl,
              // Note: Attribution and license info would need to be fetched separately from Wikimedia API
            };
          }
        }
      } else {
        console.error('Serper API error:', response.status);
      }
    }
  } catch (error) {
    console.error('Error fetching image from Serper:', error);
    // Continue to fallback
  }

  // Strategy 2: Fallback to Wikimedia Commons database
  if (supabaseClient) {
    try {
      // Parse query to extract sign type and category
      const { searchTerms, category, signType } = parseSignQuery(query);
      console.log(`🔍 Database fallback search - query="${query}", signType="${signType}", category="${category}"`);

      // Use the improved findWikimediaImage function
      let wikimediaImage = await findWikimediaImage(supabaseClient, category, query);

      if (wikimediaImage) {
        console.log(`✅ Database fallback match found! Image ID: ${wikimediaImage.id}`);
        
        // Fetch full metadata
        const { data: fullMetadata, error: metadataError } = await (supabaseClient as any)
          .from('road_sign_images')
          .select('sign_name_en, sign_name_jp, attribution_text, license_info, wikimedia_page_url')
          .eq('id', wikimediaImage.id)
          .single();

        if (metadataError) {
          console.error(`⚠️ Error fetching full metadata:`, metadataError);
        }

        return {
          imageUrl: wikimediaImage.storage_url,
          attribution: fullMetadata?.attribution_text || wikimediaImage.attribution_text || undefined,
          licenseInfo: fullMetadata?.license_info || wikimediaImage.license_info || undefined,
          wikimediaPageUrl: fullMetadata?.wikimedia_page_url || wikimediaImage.wikimedia_page_url || undefined,
          signNameEn: fullMetadata?.sign_name_en || undefined,
          signNameJp: fullMetadata?.sign_name_jp || undefined,
        };
      }

      console.log(`❌ No database match found for: "${query}"`);
    } catch (error) {
      console.error(`❌ Error querying database:`, error);
      console.error(`Error details:`, error instanceof Error ? error.stack : String(error));
    }
  } else {
    console.warn(`⚠️ No Supabase client provided - skipping database lookup`);
  }

  return null;
}

// Fetch images for multiple sections
async function fetchImagesForSections(
  sections: any[],
  supabaseClient?: ReturnType<typeof createClient> | null
): Promise<any[]> {
  const promises = sections.map(async (section) => {
    if (section.imageQuery) {
      const imageResult = await fetchImage(section.imageQuery, supabaseClient);
      if (imageResult) {
        return {
          ...section,
          image: imageResult.imageUrl,
          attribution: imageResult.attribution,
          licenseInfo: imageResult.licenseInfo,
          wikimediaPageUrl: imageResult.wikimediaPageUrl,
          imageSource: imageResult.attribution ? 'wikimedia_commons' : 'external',
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
    // Get Supabase client - try multiple methods
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('SUPABASE_PROJECT_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    // Create Supabase client for database queries (use service role key if available, otherwise anon key)
    const supabaseForDB = SUPABASE_URL && (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)
      ? createClient(
          SUPABASE_URL,
          SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY || '',
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        )
      : null;
    
    console.log(`🔧 Supabase client initialized: ${!!supabaseForDB}, using SERVICE_ROLE: ${!!SUPABASE_SERVICE_ROLE_KEY}`);

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const GOOGLE_AI_STUDIO_API_KEY = Deno.env.get("GOOGLE_AI_STUDIO_API_KEY");
    
    // Use GOOGLE_AI_STUDIO_API_KEY as primary fallback, then GEMINI_API_KEY
    const fallbackApiKey = GOOGLE_AI_STUDIO_API_KEY || GEMINI_API_KEY;
    
    console.log('AI Chat request received with', messages.length, 'messages');
    console.log('API Keys available: LOVABLE=', !!LOVABLE_API_KEY, 'GOOGLE_AI_STUDIO=', !!GOOGLE_AI_STUDIO_API_KEY, 'GEMINI=', !!GEMINI_API_KEY);
    
    if (!LOVABLE_API_KEY && !fallbackApiKey) {
      throw new Error("Neither LOVABLE_API_KEY nor GOOGLE_AI_STUDIO_API_KEY/GEMINI_API_KEY is configured");
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

    let assistantMessage: string | null = null;
    let useFallback = false;
    let response: Response;

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
              ...messages,
            ],
            stream: false,
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), 
              {
                status: 429,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          if (response.status === 402) {
            return new Response(
              JSON.stringify({ error: "AI service quota exceeded. Please contact support." }), 
              {
                status: 402,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          let errorText = '';
          try {
            errorText = await response.text();
          } catch (e) {
            errorText = `Failed to read error response: ${e instanceof Error ? e.message : 'Unknown'}`;
          }
          console.error("Primary API error:", response.status, errorText.substring(0, 200));
          throw new Error(`Primary API error: ${response.status} - ${errorText.substring(0, 100)}`);
        }

        const data = await response.json();
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
            method: "POST",
            headers: {
              "Content-Type": "application/json",
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
          throw new Error(`Fallback API error: ${response.status}`);
        }

        const data = await response.json();
        assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        
        if (!assistantMessage) {
          throw new Error("Fallback API returned empty response");
        }
      } catch (error) {
        console.error("Fallback API also failed:", error);
        throw new Error("Both primary and fallback APIs failed");
      }
    }

    if (!assistantMessage) {
      throw new Error("No response from AI");
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
      // Pass Supabase client to fetchImagesForSections so it can query the database
      const sectionsWithImages = await fetchImagesForSections(parsedResponse.sections, supabaseForDB as any);
      
      return new Response(
        JSON.stringify({ 
          sections: sectionsWithImages
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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
