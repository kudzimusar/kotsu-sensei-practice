import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { findWikimediaImage, incrementImageUsage } from "../_shared/wikimedia-image-lookup.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Detect if user question needs visual aid
function needsVisualAid(userMessage: string): boolean {
  if (!userMessage || userMessage.trim().length === 0) return false;
  
  const visualKeywords = [
    'sign', 'signal', 'marking', 'symbol', 'arrow',
    'traffic light', 'pedestrian crossing', 'zebra crossing',
    'road marking', 'lane', 'intersection marking',
    'stop sign', 'yield sign', 'speed limit', 'no parking',
    'what does', 'show me', 'how does', 'looks like', 'look like',
    'what is', 'explain', 'tell me about'
  ];
  
  const lowercaseMessage = userMessage.toLowerCase();
  const needsImage = visualKeywords.some(keyword => lowercaseMessage.includes(keyword));
  console.log(`needsVisualAid("${userMessage}"): ${needsImage}`);
  return needsImage;
}

// Get Supabase client for image lookup
function getSupabaseClient() {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Extract category from query (simple heuristic)
function extractCategoryFromQuery(query: string): string | null {
  const lowerQuery = query.toLowerCase();
  
  // Specific sign types that map to categories
  if (lowerQuery.includes('stop sign') || lowerQuery.includes('stop') || lowerQuery.includes('一時停止')) {
    return 'regulatory'; // Stop signs are regulatory
  }
  if (lowerQuery.includes('yield') || lowerQuery.includes('give way')) {
    return 'regulatory';
  }
  if (lowerQuery.includes('speed limit') || lowerQuery.includes('no parking') || lowerQuery.includes('no entry')) {
    return 'regulatory';
  }
  
  if (lowerQuery.includes('warning') || lowerQuery.includes('caution') || lowerQuery.includes('警戒')) {
    return 'warning';
  }
  if (lowerQuery.includes('regulatory') || lowerQuery.includes('prohibition') || lowerQuery.includes('規制')) {
    return 'regulatory';
  }
  if (lowerQuery.includes('instruction') || lowerQuery.includes('indication') || lowerQuery.includes('指示')) {
    return 'indication';
  }
  if (lowerQuery.includes('guidance') || lowerQuery.includes('information') || lowerQuery.includes('案内')) {
    return 'guidance';
  }
  if (lowerQuery.includes('auxiliary') || lowerQuery.includes('補助')) {
    return 'auxiliary';
  }
  if (lowerQuery.includes('marking') || lowerQuery.includes('道路標示')) {
    return 'road-markings';
  }
  
  return null;
}

// Fetch a single image - tries Wikimedia Commons first, then Serper API as fallback
async function fetchImage(query: string): Promise<{
  image: string | null;
  attribution?: string;
  imageSource?: string;
  wikimediaPageUrl?: string;
} | null> {
  const supabase = getSupabaseClient();
  const category = extractCategoryFromQuery(query);
  
  // Strategy 1: Try Wikimedia Commons database first
  if (supabase) {
    const wikimediaImage = await findWikimediaImage(supabase, category, query);
    
    if (wikimediaImage) {
      // Increment usage count
      await incrementImageUsage(supabase, wikimediaImage.id);
      console.log(`Using Wikimedia Commons image for: ${query}`);
      return {
        image: wikimediaImage.storage_url,
        attribution: wikimediaImage.attribution_text || undefined,
        imageSource: 'wikimedia_commons',
        wikimediaPageUrl: wikimediaImage.wikimedia_page_url || undefined
      };
    }
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
      return {
        image: imageUrl,
        imageSource: 'serper'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching image from Serper:', error);
    return null;
  }
}

// Force every AI response into sections format with guaranteed images
function forceSectionFormat(aiResponse: any, userQuery: string, imageUrl: string | null): any[] {
  console.log('forceSectionFormat called with:', {
    hasSections: !!aiResponse?.sections,
    sectionsLength: aiResponse?.sections?.length || 0,
    hasMessage: !!aiResponse?.message,
    isString: typeof aiResponse === 'string',
    hasImageUrl: !!imageUrl
  });

  // If AI returned proper sections, use them and guarantee images
  if (aiResponse?.sections && Array.isArray(aiResponse.sections) && aiResponse.sections.length > 0) {
    console.log(`Using existing ${aiResponse.sections.length} sections from AI, ensuring images...`);
    return aiResponse.sections.map((section: any) => ({
      heading: section.heading || null,
      content: section.content || "",
      summary: section.summary || null,
      image: section.image || imageUrl, // GUARANTEE IMAGE
    }));
  }

  // If AI returned plain text or message field → wrap it as a single section
  const content = typeof aiResponse === "string" 
    ? aiResponse 
    : (aiResponse?.message || "");

  console.log('Converting plain text response to sections format');
  return [
    {
      heading: null,
      content: content,
      summary: null,
      image: imageUrl, // GUARANTEE IMAGE
    }
  ];
}

// Fetch images for multiple sections
async function fetchImagesForSections(sections: any[]): Promise<any[]> {
  console.log(`Fetching images for ${sections.length} sections...`);
  const promises = sections.map(async (section, index) => {
    if (section.imageQuery) {
      console.log(`Section ${index + 1}: Fetching image for query "${section.imageQuery}"`);
      try {
        const imageResult = await fetchImage(section.imageQuery);
        if (imageResult && imageResult.image) {
          console.log(`Section ${index + 1}: Found image: ${imageResult.image.substring(0, 80)}...`);
          return { 
            ...section, 
            image: imageResult.image,
            attribution: imageResult.attribution,
            imageSource: imageResult.imageSource,
            wikimediaPageUrl: imageResult.wikimediaPageUrl
          };
        } else {
          console.log(`Section ${index + 1}: No image found for query "${section.imageQuery}"`);
        }
        return { ...section, image: section.image || null };
      } catch (error) {
        console.error(`Section ${index + 1}: Error fetching image:`, error);
        return { ...section, image: section.image || null };
      }
    } else {
      console.log(`Section ${index + 1}: No imageQuery provided, using existing image or null`);
    }
    return section;
  });
  
  const results = await Promise.all(promises);
  const imagesFound = results.filter(s => s.image).length;
  console.log(`Image fetch complete: ${imagesFound}/${sections.length} sections have images`);
  return results;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      throw new Error(`Invalid request body: ${e instanceof Error ? e.message : 'Failed to parse JSON'}`);
    }

    const { messages } = body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages array is required and must not be empty");
    }

    // Validate message structure
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg || typeof msg !== 'object') {
        throw new Error(`Invalid message at index ${i}: must be an object`);
      }
      if (!msg.role || (msg.role !== 'user' && msg.role !== 'assistant' && msg.role !== 'system')) {
        throw new Error(`Invalid message role at index ${i}: ${msg.role}. Must be 'user', 'assistant', or 'system'`);
      }
      // Allow empty content if images are present
      const hasImages = msg.images && Array.isArray(msg.images) && msg.images.length > 0;
      if (msg.role !== 'system' && !hasImages && (!msg.content || typeof msg.content !== 'string' || msg.content.trim() === '')) {
        throw new Error(`Invalid message content at index ${i}: must have either content or images`);
      }
      // Validate content type if present
      if (msg.content && typeof msg.content !== 'string') {
        throw new Error(`Invalid message content at index ${i}: content must be a string`);
      }
    }

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

    // Check if the last message has images
    const lastMessage = messages[messages.length - 1];
    const hasImages = lastMessage?.images && Array.isArray(lastMessage.images) && lastMessage.images.length > 0;

    let imageContext = '';
    if (hasImages) {
      try {
        const imageDescriptions = lastMessage.images.map((img: any, idx: number) => {
          // Safely access image properties
          const signNameEn = img?.sign_name_en || img?.signNameEn || 'Unknown';
          const signNameJp = img?.sign_name_jp || img?.signNameJp || '不明';
          const category = img?.sign_category || img?.signCategory || 'Unknown';
          const meaning = img?.sign_meaning || img?.signMeaning || 'Not analyzed';
          const explanation = img?.ai_explanation || img?.aiExplanation || 'No explanation available';
          const confidence = img?.ai_confidence || img?.aiConfidence || 0;
          const storageUrl = img?.storage_url || img?.storageUrl || 'N/A';
          
          return `Image ${idx + 1}:
- Sign Name (EN): ${signNameEn}
- Sign Name (JP): ${signNameJp}
- Category: ${category}
- Meaning: ${meaning}
- AI Explanation: ${explanation}
- Confidence: ${confidence ? (Number(confidence) * 100).toFixed(0) + '%' : 'N/A'}
- Storage URL: ${storageUrl}`;
        }).join('\n\n');
        
        imageContext = `\n\nIMPORTANT: The user has uploaded ${lastMessage.images.length} road sign image(s). Here is the AI analysis:\n\n${imageDescriptions}\n\nWhen responding, reference these images and provide detailed explanations about the signs shown. If the user asks questions about the signs, use the AI analysis provided above.`;
      } catch (error) {
        console.error('Error processing image context:', error);
        // Continue without image context if there's an error
        imageContext = '';
      }
    }

    const systemPrompt = `You are a friendly and knowledgeable Japanese driving instructor assistant named "Kōtsū Sensei" (交通先生). Your role is to help students understand Japanese traffic laws, road signs, driving techniques, and test preparation.

SPECIALIZATION IN JAPANESE ROAD SIGNS:
You are an expert in Japanese traffic signs and road markings. When users upload images of road signs, you can see the AI analysis results which include:
- Sign name in English and Japanese (hiragana/katakana/kanji)
- Category (regulatory, warning, indication, guidance, auxiliary, road-markings)
- Meaning and explanation
- Confidence score

Use this information to provide accurate, detailed explanations about Japanese road signs. Reference specific Japanese traffic laws and regulations when relevant.

CRITICAL RESPONSE FORMAT:
When users ask about visual topics (signs, markings, signals) OR when they upload images, you MUST respond with a JSON structure containing sections. Each section should have:
- heading: A clear H3-level heading for the topic
- imageQuery: A specific search term for fetching a relevant image (e.g., "stop sign japan", "speed limit 50 sign japan") OR use the uploaded image URL if available
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
- When users upload images, provide detailed analysis based on the AI recognition results

Topics you can help with:
- Japanese traffic laws and regulations
- Road signs and their meanings
- Right-of-way rules
- Speed limits and parking regulations
- Driving techniques and best practices
- Test preparation strategies
- Common mistakes to avoid${imageContext}`;

    // Try LOVABLE_API_KEY first, fallback to GOOGLE_AI_STUDIO_API_KEY
    let response = null;
    let assistantMessage = null;
    let useFallback = false;

    if (LOVABLE_API_KEY) {
      try {
        console.log("Attempting primary API (LOVABLE_API_KEY)");
        // Prepare messages for API - handle images and empty content
        const apiMessages = messages.map((msg: any) => {
          const apiMsg: any = {
            role: msg.role,
          };
          // Include content if present
          if (msg.content) {
            apiMsg.content = msg.content;
          }
          // Include images if present (for vision API)
          if (msg.images && Array.isArray(msg.images) && msg.images.length > 0) {
            apiMsg.images = msg.images;
          }
          return apiMsg;
        });

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
              ...apiMessages,
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
        // Combine system prompt with user messages
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
            // Handle user messages with images
            const parts: any[] = [];
            if (msg.content) {
              parts.push({ text: msg.content });
            }
            // Add image URLs if present - for now just include text reference
            // Note: Gemini Vision API would need actual image data, not just URLs
            if (msg.images && Array.isArray(msg.images) && msg.images.length > 0) {
              // Add text reference to images
              const imageRefs = msg.images.map((img: any, idx: number) => {
                const signName = img?.sign_name_en || img?.signNameEn || `Image ${idx + 1}`;
                return signName;
              }).join(', ');
              parts.push({ text: `[User uploaded images: ${imageRefs}]` });
            }
            // Ensure at least one part exists
            if (parts.length === 0) {
              parts.push({ text: "Please analyze the uploaded road sign image(s)." });
            }
            conversationHistory.push({
              role: "user",
              parts: parts
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
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
              },
            }),
          }
        );

        if (!response.ok) {
          let errorText = '';
          try {
            errorText = await response.text();
          } catch (e) {
            errorText = `Failed to read error response: ${e instanceof Error ? e.message : 'Unknown'}`;
          }
          console.error("Fallback API error:", response.status, errorText);
          throw new Error(`Fallback API error: ${response.status} - ${errorText.substring(0, 200)}`);
        }

        let data: any;
        try {
          data = await response.json();
        } catch (e) {
          console.error("Failed to parse fallback API response:", e);
          throw new Error(`Fallback API returned invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }

        assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        if (!assistantMessage) {
          console.error("Fallback API returned empty response:", JSON.stringify(data));
          throw new Error("Fallback API returned empty response");
        }
        
        console.log("Fallback API succeeded, response length:", assistantMessage.length);
      } catch (error) {
        console.error("Both API keys failed:", error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`All AI services are currently unavailable: ${errorMsg}`);
      }
    } else if (useFallback) {
      throw new Error("No AI API keys are configured");
    }

    if (!assistantMessage || assistantMessage.trim() === "") {
      console.error("No assistant message received from any API");
      throw new Error("No response from AI - all services returned empty responses");
    }

    console.log('AI Chat response generated successfully');

    // STEP 1: ALWAYS fetch an image FIRST (before processing AI response)
    const userQuery = lastMessage?.content || '';
    console.log(`🔍 STEP 1: Fetching image FIRST for query: "${userQuery}"`);
    
    let guaranteedImageUrl: string | null = null;
    let guaranteedImageAttribution: string | undefined = undefined;
    let guaranteedImageSource: string | undefined = undefined;
    let guaranteedImagePageUrl: string | undefined = undefined;
    const detectedCategory = extractCategoryFromQuery(userQuery);
    
    // Try multiple strategies to find an image
    try {
      const supabase = getSupabaseClient();
      
      // Strategy 1: Try full user query
      if (userQuery && supabase) {
        const wikimediaImage = await findWikimediaImage(supabase, detectedCategory, userQuery);
        if (wikimediaImage) {
          guaranteedImageUrl = wikimediaImage.storage_url;
          guaranteedImageAttribution = wikimediaImage.attribution_text;
          guaranteedImageSource = 'wikimedia_commons';
          guaranteedImagePageUrl = wikimediaImage.wikimedia_page_url;
          await incrementImageUsage(supabase, wikimediaImage.id);
          console.log(`✅ Found image via full query: ${guaranteedImageUrl.substring(0, 80)}...`);
        }
      }
      
      // Strategy 2: Try extracting key terms if full query didn't work
      if (!guaranteedImageUrl && userQuery && supabase) {
        const queryTerms = userQuery.toLowerCase().split(/\s+/)
          .filter(term => term.length >= 2 && !['the', 'a', 'an', 'is', 'are', 'what', 'how', 'does', 'when', 'where', 'why'].includes(term))
          .sort((a, b) => b.length - a.length)
          .slice(0, 3);
        
        for (const term of queryTerms) {
          console.log(`  Trying term: "${term}"`);
          const wikimediaImage = await findWikimediaImage(supabase, detectedCategory, term);
          if (wikimediaImage) {
            guaranteedImageUrl = wikimediaImage.storage_url;
            guaranteedImageAttribution = wikimediaImage.attribution_text;
            guaranteedImageSource = 'wikimedia_commons';
            guaranteedImagePageUrl = wikimediaImage.wikimedia_page_url;
            await incrementImageUsage(supabase, wikimediaImage.id);
            console.log(`✅ Found image via term "${term}": ${guaranteedImageUrl.substring(0, 80)}...`);
            break;
          }
        }
      }
      
      // Strategy 3: Category-based fallback
      if (!guaranteedImageUrl && detectedCategory && supabase) {
        console.log(`  Trying category fallback: ${detectedCategory}`);
        const categoryImage = await findWikimediaImage(supabase, detectedCategory, null);
        if (categoryImage) {
          guaranteedImageUrl = categoryImage.storage_url;
          guaranteedImageAttribution = categoryImage.attribution_text;
          guaranteedImageSource = 'wikimedia_commons';
          guaranteedImagePageUrl = categoryImage.wikimedia_page_url;
          await incrementImageUsage(supabase, categoryImage.id);
          console.log(`✅ Found image via category: ${guaranteedImageUrl.substring(0, 80)}...`);
        }
      }
      
      // Strategy 4: Ultimate fallback - any regulatory sign
      if (!guaranteedImageUrl && supabase) {
        console.log(`  Trying ultimate fallback: regulatory sign`);
        const fallbackImage = await findWikimediaImage(supabase, 'regulatory', null);
        if (fallbackImage) {
          guaranteedImageUrl = fallbackImage.storage_url;
          guaranteedImageAttribution = fallbackImage.attribution_text;
          guaranteedImageSource = 'wikimedia_commons';
          guaranteedImagePageUrl = fallbackImage.wikimedia_page_url;
          await incrementImageUsage(supabase, fallbackImage.id);
          console.log(`✅ Found image via regulatory fallback: ${guaranteedImageUrl.substring(0, 80)}...`);
        }
      }
      
      // Strategy 5: Serper API fallback (if Wikimedia failed)
      if (!guaranteedImageUrl) {
        console.log(`  Trying Serper API fallback`);
        const imageResult = await fetchImage(userQuery || 'japan road sign');
        if (imageResult && imageResult.image) {
          guaranteedImageUrl = imageResult.image;
          guaranteedImageAttribution = imageResult.attribution;
          guaranteedImageSource = imageResult.imageSource;
          guaranteedImagePageUrl = imageResult.wikimediaPageUrl;
          console.log(`✅ Found image via Serper API: ${guaranteedImageUrl.substring(0, 80)}...`);
        }
      }
      
    } catch (error) {
      console.error('Error fetching guaranteed image:', error);
    }
    
    if (!guaranteedImageUrl) {
      console.warn('⚠️ WARNING: No image found after all strategies - response will have null image');
    } else {
      console.log(`✅ GUARANTEED IMAGE URL: ${guaranteedImageUrl.substring(0, 100)}...`);
    }

    // STEP 2: Parse AI response (try JSON first, fallback to plain text)
    console.log(`🔍 STEP 2: Parsing AI response...`);
    let parsedResponse: any = null;
    try {
      // Try to extract JSON from markdown code blocks if present
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
      console.log('✅ Successfully parsed structured JSON response');
    } catch (e) {
      console.log('⚠️ Response is plain text, not JSON structured:', e instanceof Error ? e.message : 'Parse error');
      parsedResponse = assistantMessage; // Keep as plain text for forceSectionFormat
    }

    // STEP 3: Force sections format with guaranteed image
    console.log(`🔍 STEP 3: Forcing sections format with guaranteed image...`);
    let sections = forceSectionFormat(parsedResponse, userQuery, guaranteedImageUrl);
    
    // STEP 4: Fetch additional images for sections that have imageQuery
    console.log(`🔍 STEP 4: Fetching additional images for sections with imageQuery...`);
    sections = await fetchImagesForSections(sections);
    
    // Ensure every section still has an image (use guaranteed image if missing) and attribution
    sections = sections.map((section: any) => ({
      ...section,
      image: section.image || guaranteedImageUrl || null,
      attribution: section.attribution || guaranteedImageAttribution,
      imageSource: section.imageSource || guaranteedImageSource,
      wikimediaPageUrl: section.wikimediaPageUrl || guaranteedImagePageUrl
    }));
    
    const imagesCount = sections.filter((s: any) => s.image).length;
    console.log(`✅ FINAL: Returning ${sections.length} sections, ${imagesCount} with images`);
    
    // Include uploaded images in response if available
    const responseImages = hasImages ? lastMessage.images : undefined;
    
    return new Response(
      JSON.stringify({ 
        sections: sections,
        images: responseImages
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Log the full error for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    const errorStack = error instanceof Error ? error.stack : "No stack trace";
    console.error("========== AI-CHAT ERROR ==========");
    console.error("Error message:", errorMessage);
    console.error("Error stack:", errorStack);
    console.error("Error type:", error?.constructor?.name || typeof error);
    try {
      console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    } catch (e) {
      console.error("Could not stringify error:", e);
    }
    console.error("===================================");
    
    // Return detailed error response
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
