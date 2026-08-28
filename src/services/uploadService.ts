import { supabase } from './supabase';

/**
 * Uploads a local file to Supabase Storage and returns its public URL
 * @param localUri Local file path (e.g., file:///...)
 * @param bucketName Name of the Supabase storage bucket
 * @param folderPath Optional folder path inside the bucket (e.g., 'pdfs/')
 * @returns The public URL of the uploaded file or null if failed
 */
export const uploadFileToSupabase = async (
  localUri: string,
  bucketName: string = 'inspections_media',
  folderPath: string = ''
): Promise<string | null> => {
  if (!localUri) return null;
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) return localUri;

  let formattedUri = localUri;
  if (!formattedUri.startsWith('file://') && formattedUri.startsWith('/')) {
    formattedUri = `file://${formattedUri}`;
  }

  if (!formattedUri.startsWith('file://')) {
    return null;
  }

  try {
    const ext = formattedUri.substring(formattedUri.lastIndexOf('.') + 1) || 'bin';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

    // React Native FormData approach for uploading files
    const formData = new FormData();
    formData.append('file', {
      uri: formattedUri,
      name: fileName,
      type: ext.toLowerCase() === 'pdf' ? 'application/pdf' : `image/${ext.toLowerCase()}`,
    } as any);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, formData, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn('Error uploading file to Supabase Storage:', error);
      return null;
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || null;
  } catch (error) {
    console.warn('Exception during file upload:', error);
    return null;
  }
};
