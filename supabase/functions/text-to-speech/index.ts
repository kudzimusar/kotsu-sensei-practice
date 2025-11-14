import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const HUME_API_URL = "https://api.hume.ai/v0/tts";
const DEFAULT_VOICE_ID = "445d65ed-a87f-4140-9820-daf6d4f0a200";
const FREE_TIER_LIMIT = 10000; // characters per month

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HUME_API_KEY = Deno.env.get('HUME_API_KEY');
    
    if (!HUME_API_KEY) {
      throw new Error('HUME_API_KEY is not configured');
    }

    const { text, voice_id } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required and must be a string' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate text length (prevent abuse)
    if (text.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Text is too long. Maximum 5000 characters allowed.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const voiceId = voice_id || DEFAULT_VOICE_ID;

    console.log(`Generating TTS for ${text.length} characters with voice ${voiceId}`);

    // Call Hume AI TTS API
    const response = await fetch(HUME_API_URL, {
      method: 'POST',
      headers: {
        'X-Hume-Api-Key': HUME_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        voice: {
          id: voiceId,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hume AI TTS error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again in a moment.',
            characters_used: 0,
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (response.status === 402 || response.status === 403) {
        return new Response(
          JSON.stringify({ 
            error: 'TTS service quota exceeded. Please check your account limits.',
            characters_used: 0,
          }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      throw new Error(`Hume AI TTS error: ${response.status} - ${errorText}`);
    }

    const audioBlob = await response.blob();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    const charactersUsed = text.length;

    return new Response(
      JSON.stringify({
        audio_url: audioDataUrl,
        characters_used: charactersUsed,
        remaining_chars: FREE_TIER_LIMIT, // Client will track actual usage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        characters_used: 0,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

