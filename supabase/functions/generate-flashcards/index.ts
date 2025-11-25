import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Fetch a single image for a specific query using Serper API
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
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    console.log(`Generating ${count} flashcards for category: ${category}`);

    // Get category info
    const categoryInfo = FLASHCARD_CATEGORIES[category as keyof typeof FLASHCARD_CATEGORIES];
    if (!categoryInfo) {
      throw new Error(`Invalid category: ${category}`);
    }

    // Select random queries from the category
    const availableQueries = [...categoryInfo.queries];
    const selectedQueries = [];
    const requestedCount = Math.min(count, availableQueries.length);
    
    for (let i = 0; i < requestedCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableQueries.length);
      selectedQueries.push(availableQueries.splice(randomIndex, 1)[0]);
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nGenerate ${requestedCount} flashcards with these image queries: ${selectedQueries.join(', ')}. Return only valid JSON.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        }),
      }
    );

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
    const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!assistantMessage) {
      throw new Error("No response from AI");
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

    // Fetch images for each flashcard
    console.log(`Fetching images for ${flashcards.length} flashcards...`);
    const flashcardsWithImages = await Promise.all(
      flashcards.map(async (flashcard) => {
        const imageUrl = await fetchImage(flashcard.imageQuery);
        return {
          ...flashcard,
          imageUrl: imageUrl || null
        };
      })
    );

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


