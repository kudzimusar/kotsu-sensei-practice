import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

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

// Fetch a single image for a specific query
async function fetchImage(query: string): Promise<string | null> {
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
    return data.images?.[0]?.imageUrl || null;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

// Fetch images for multiple sections
async function fetchImagesForSections(sections: any[]): Promise<any[]> {
  const promises = sections.map(async (section) => {
    if (section.imageQuery) {
      const imageUrl = await fetchImage(section.imageQuery);
      return { ...section, image: imageUrl };
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
    const GOOGLE_AI_STUDIO_API_KEY = Deno.env.get("GOOGLE_AI_STUDIO_API_KEY");
    
    if (!LOVABLE_API_KEY && !GOOGLE_AI_STUDIO_API_KEY) {
      throw new Error("Neither LOVABLE_API_KEY nor GOOGLE_AI_STUDIO_API_KEY is configured");
    }

    console.log('AI Chat request received with', messages.length, 'messages');

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

    // Try LOVABLE_API_KEY first, fallback to GOOGLE_AI_STUDIO_API_KEY
    let response: Response;
    let assistantMessage: string;
    let useFallback = false;

    if (LOVABLE_API_KEY) {
      try {
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
          if (response.status === 429 || response.status === 402) {
            throw new Error(`Primary API error: ${response.status}`);
          }
          throw new Error(`Primary API error: ${response.status}`);
        }

        const data = await response.json();
        assistantMessage = data.choices?.[0]?.message?.content;
      } catch (error) {
        console.warn("LOVABLE_API_KEY failed, trying fallback:", error);
        useFallback = true;
      }
    } else {
      useFallback = true;
    }

    // Fallback to GOOGLE_AI_STUDIO_API_KEY
    if (useFallback && GOOGLE_AI_STUDIO_API_KEY) {
      console.log("Using GOOGLE_AI_STUDIO_API_KEY fallback");
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
            conversationHistory.push({
              role: "user",
              parts: [{ text: msg.content || "" }]
            });
          }
        }

        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_AI_STUDIO_API_KEY}`,
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
              }
            })
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Fallback API error:", response.status, errorText);
          throw new Error(`Fallback API error: ${response.status} - ${errorText.substring(0, 200)}`);
        }

        const data = await response.json();
        assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        if (!assistantMessage) {
          console.error("Fallback API returned empty response:", JSON.stringify(data));
          throw new Error("Fallback API returned empty response");
        }
        
        console.log("Fallback API succeeded, response length:", assistantMessage.length);
      } catch (error) {
        console.error("Both API keys failed:", error);
        throw new Error(`All AI services are currently unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (useFallback) {
      throw new Error("No AI API keys are configured");
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
      const sectionsWithImages = await fetchImagesForSections(parsedResponse.sections);
      
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
