import { supabase } from './supabase';

/**
 * Helper to determine standard MIME type from file extension
 */
export const getMimeType = (extension: string): string => {
  switch (extension.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
};

/**
 * Reads a local file URI (file:// or content://) and converts it into an ArrayBuffer
 */
export const readLocalFileAsArrayBuffer = async (uri: string): Promise<ArrayBuffer | null> => {
  try {
    const response = await fetch(uri);
    if (typeof response.arrayBuffer === 'function') {
      return await response.arrayBuffer();
    }
    const blob = await response.blob();
    return await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('FileReader did not return an ArrayBuffer'));
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(blob);
    });
  } catch (err) {
    console.warn('Failed to read local file as ArrayBuffer:', err);
    return null;
  }
};

/**
 * Uploads a local file to Supabase Storage and returns its public URL
 * @param localUri Local file path (e.g., file:///...)
 * @param bucketName Name of the Supabase storage bucket
 * @param folderPath Optional folder path inside the bucket (e.g., 'photos' or 'pdfs')
 * @returns The public URL of the uploaded file or null if failed
 */
export const uploadFileToSupabase = async (
  localUri: string,
  bucketName: string = 'inspections_media',
  folderPath: string = ''
): Promise<string | null> => {
  if (!localUri) return null;
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    return localUri;
  }

  let formattedUri = localUri;
  if (!formattedUri.startsWith('file://') && !formattedUri.startsWith('content://') && formattedUri.startsWith('/')) {
    formattedUri = `file://${formattedUri}`;
  }

  if (!formattedUri.startsWith('file://') && !formattedUri.startsWith('content://')) {
    console.warn('Invalid local URI format:', formattedUri);
    return null;
  }

  try {
    const cleanUri = formattedUri.split('?')[0];
    const ext = cleanUri.substring(cleanUri.lastIndexOf('.') + 1) || 'jpg';
    const mimeType = getMimeType(ext);
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

    // React Native ArrayBuffer upload to Supabase Storage
    const fileBuffer = await readLocalFileAsArrayBuffer(formattedUri);
    if (!fileBuffer || fileBuffer.byteLength === 0) {
      console.warn('Local file buffer is empty for URI:', formattedUri);
      return null;
    }

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn('Error uploading file to Supabase Storage:', error);
      return null;
    }

    // Retrieve public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl || null;
    if (publicUrl) {
      console.log(`[Supabase Storage] Successfully uploaded: ${filePath}`);
    }
    return publicUrl;
  } catch (error) {
    console.warn('Exception during file upload:', error);
    return null;
  }
};

/**
 * Uploads multiple local files with concurrency control and returns a mapping of localUri -> remoteUrl
 */
export const uploadFilesInBatch = async (
  localUris: string[],
  bucketName: string = 'inspections_media',
  folderPath: string = 'photos',
  concurrency: number = 3
): Promise<Record<string, string>> => {
  const urlMap: Record<string, string> = {};
  const uniqueUris = Array.from(new Set(localUris.filter(Boolean)));

  if (uniqueUris.length === 0) return urlMap;

  // Process in chunks of `concurrency`
  for (let i = 0; i < uniqueUris.length; i += concurrency) {
    const chunk = uniqueUris.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (uri) => {
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
          urlMap[uri] = uri;
          return;
        }
        const uploadedUrl = await uploadFileToSupabase(uri, bucketName, folderPath);
        if (uploadedUrl) {
          urlMap[uri] = uploadedUrl;
        }
      })
    );
  }

  return urlMap;
};

