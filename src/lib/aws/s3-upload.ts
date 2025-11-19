import { supabase } from "@/integrations/supabase/client";

export interface S3UploadResult {
  publicUrl: string;
  key: string;
}

export async function uploadToS3(
  file: File,
  folder: string = 'certifications'
): Promise<S3UploadResult> {
  try {
    // Get presigned URL from our edge function
    const { data, error } = await supabase.functions.invoke(
      'generate-s3-presigned-url',
      {
        body: {
          fileName: file.name,
          fileType: file.type,
          folder,
        },
      }
    );

    if (error) {
      throw new Error(`Failed to get presigned URL: ${error.message}`);
    }

    if (!data?.presignedUrl || !data?.publicUrl || !data?.key) {
      throw new Error('Invalid response from presigned URL service');
    }

    // Upload file to S3 using presigned URL
    const uploadResponse = await fetch(data.presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed: ${uploadResponse.statusText}`);
    }

    return {
      publicUrl: data.publicUrl,
      key: data.key,
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
}
