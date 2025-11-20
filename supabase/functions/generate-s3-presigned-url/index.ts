import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.error('No Authorization header found');
      return new Response(JSON.stringify({ error: 'Unauthorized - No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract token from Bearer format
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      console.error('No token found in Authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token format' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with service role key to verify the token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user from token
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);

    if (authError) {
      console.error('Auth error:', authError.message);
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token', details: authError.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!user) {
      console.error('No user found after token verification');
      return new Response(JSON.stringify({ error: 'Unauthorized - User not found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User authenticated:', user.id);

    const { fileName, fileType, folder = 'certifications' } = await req.json();

    if (!fileName || !fileType) {
      return new Response(
        JSON.stringify({ error: 'fileName and fileType are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const AWS_REGION = Deno.env.get('AWS_REGION');
    const AWS_S3_BUCKET = Deno.env.get('AWS_S3_BUCKET');

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_S3_BUCKET) {
      console.error('Missing AWS credentials');
      return new Response(
        JSON.stringify({ error: 'AWS configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate AWS region format (must be like us-east-1, eu-west-1, etc.)
    if (!AWS_REGION.match(/^[a-z0-9-]+$/)) {
      console.error('Invalid AWS_REGION format:', AWS_REGION);
      return new Response(
        JSON.stringify({ 
          error: `Invalid AWS region: "${AWS_REGION}". Must be a valid AWS region like "us-east-1"` 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('AWS Configuration - Region:', AWS_REGION, 'Bucket:', AWS_S3_BUCKET, 'Folder:', folder);

    // Generate unique file name
    const timestamp = new Date().getTime();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${user.id}/${timestamp}-${sanitizedFileName}`;

    // Create presigned URL using AWS Signature V4
    const date = new Date();
    const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    
    const credential = `${AWS_ACCESS_KEY_ID}/${dateString}/${AWS_REGION}/s3/aws4_request`;
    
    const params = new URLSearchParams({
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': credential,
      'X-Amz-Date': amzDate,
      'X-Amz-Expires': '3600',
      'X-Amz-SignedHeaders': 'host',
    });

    const canonicalRequest = [
      'PUT',
      `/${key}`,
      params.toString(),
      `host:${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com`,
      '',
      'host',
      'UNSIGNED-PAYLOAD',
    ].join('\n');

    const encoder = new TextEncoder();
    const hashedRequest = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(canonicalRequest)
    );
    const hashedRequestHex = Array.from(new Uint8Array(hashedRequest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      `${dateString}/${AWS_REGION}/s3/aws4_request`,
      hashedRequestHex,
    ].join('\n');

    // Create signing key
    const getSignatureKey = async (key: string, dateStamp: string, regionName: string, serviceName: string) => {
      const kDate = await crypto.subtle.importKey(
        'raw',
        encoder.encode(`AWS4${key}`),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const kDateSigned = await crypto.subtle.sign('HMAC', kDate, encoder.encode(dateStamp));
      
      const kRegion = await crypto.subtle.importKey(
        'raw',
        kDateSigned,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const kRegionSigned = await crypto.subtle.sign('HMAC', kRegion, encoder.encode(regionName));
      
      const kService = await crypto.subtle.importKey(
        'raw',
        kRegionSigned,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const kServiceSigned = await crypto.subtle.sign('HMAC', kService, encoder.encode(serviceName));
      
      const kSigning = await crypto.subtle.importKey(
        'raw',
        kServiceSigned,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      return kSigning;
    };

    const signingKey = await getSignatureKey(AWS_SECRET_ACCESS_KEY, dateString, AWS_REGION, 's3');
    const signature = await crypto.subtle.sign('HMAC', signingKey, encoder.encode(stringToSign));
    const signatureHex = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    params.append('X-Amz-Signature', signatureHex);

    const presignedUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}?${params.toString()}`;
    const publicUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;

    console.log('Generated presigned URL for:', key);

    return new Response(
      JSON.stringify({
        presignedUrl,
        publicUrl,
        key,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('========== S3 PRESIGNED URL ERROR ==========');
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('===========================================');
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
