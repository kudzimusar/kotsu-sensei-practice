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

// Fetch relevant images from Serper API
async function fetchImages(query: string): Promise<string[]> {
  try {
    const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY');
    
    if (!SERPER_API_KEY) {
      console.log('SERPER_API_KEY not configured, skipping image search');
      return [];
    }

    const response = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: `${query} japan driving traffic road`,
        num: 3
      })
    });

    if (!response.ok) {
      console.error('Serper API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.images?.slice(0, 3).map((img: any) => img.imageUrl) || [];
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('AI Chat request received with', messages.length, 'messages');

    const systemPrompt = `You are a friendly and knowledgeable Japanese driving instructor assistant named "Kōtsū Sensei" (交通先生). Your role is to help students understand Japanese traffic laws, road signs, driving techniques, and test preparation.

IMPORTANT: When users ask about visual elements (signs, markings, signals, traffic lights), relevant images will be automatically provided alongside your explanation. You can reference these images in your response by saying things like "As you can see in the images below..." or "The images show examples of..."

Guidelines:
- Provide clear, accurate, and helpful explanations
- Reference specific Japanese traffic rules and regulations when applicable
- When images are provided, describe what students should look for in them
- Use real-world examples to illustrate concepts
- Break down complex topics into easy-to-understand steps
- Be encouraging and supportive - learning to drive can be stressful
- When discussing road signs, describe them clearly
- Provide study tips and memory techniques
- Keep responses concise but thorough
- Use markdown formatting for better readability (bold, lists, etc.)

Topics you can help with:
- Japanese traffic laws and regulations
- Road signs and their meanings
- Right-of-way rules
- Speed limits and parking regulations
- Driving techniques and best practices
- Test preparation strategies
- Common mistakes to avoid`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error("No response from AI");
    }

    console.log('AI Chat response generated successfully');

    // Check if we need to fetch images
    const userMessage = messages[messages.length - 1]?.content || '';
    let imageUrls: string[] = [];
    
    if (needsVisualAid(userMessage)) {
      console.log('Visual aid detected, fetching images...');
      imageUrls = await fetchImages(userMessage);
      console.log(`Fetched ${imageUrls.length} images`);
    }

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        images: imageUrls
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
