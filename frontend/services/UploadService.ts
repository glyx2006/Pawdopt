// Upload Service
// Handles all file upload operations
import { getAccessToken } from './AuthService';

// ================== API ENDPOINT CONSTANTS ==================
const PRESIGN_IMAGE_URLS = 'https://1g53nof6f8.execute-api.eu-west-2.amazonaws.com/presignImageUrls';

// ================== INTERFACES ==================
export interface PresignedUrlResponse {
  uploadUrls: string[];
  keys: string[];
}

// ================== S3 UPLOAD OPERATIONS ==================
export const getPresignedUrls = async (fileCount: number, token: string): Promise<PresignedUrlResponse> => {
  const response = await fetch(PRESIGN_IMAGE_URLS, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ count: fileCount }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get pre-signed URLs: ${text}`);
  }

  const json = await response.json();
  console.log('Presigned URL response:', json);

  const uploadUrls = json.uploadUrls ?? json.urls ?? [];
  const keys = json.keys ?? [];

  return { uploadUrls, keys };
};

export const uploadImagesToS3 = async (uris: string[], urls: string[]): Promise<void> => {
  const uploads = uris.map(async (uri, i) => {
    const res = await fetch(uri);
    const blob = await res.blob();

    const uploadRes = await fetch(urls[i], {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: blob,
    });

    return uploadRes;
  });

  const results = await Promise.all(uploads);
  const failed = results.filter(r => !r.ok);
  if (failed.length > 0) {
    throw new Error("One or more uploads failed.");
  }
};

// ================== HELPER FUNCTIONS ==================
export const uploadImages = async (imageUris: string[]): Promise<string[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error("No access token available");

  // Get presigned URLs
  const { uploadUrls, keys } = await getPresignedUrls(imageUris.length, token);
  
  // Upload images to S3
  await uploadImagesToS3(imageUris, uploadUrls);
  
  // Return the keys for the uploaded images
  return keys;
};

export const uploadSingleImage = async (imageUri: string): Promise<string> => {
  const keys = await uploadImages([imageUri]);
  return keys[0];
};

// ================== FILE VALIDATION ==================
export const validateImageFile = (file: any, options?: {
  maxSizeBytes?: number;
  allowedTypes?: string[];
}): { isValid: boolean; error?: string } => {
  const { 
    maxSizeBytes = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'] 
  } = options || {};

  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (file.size && file.size > maxSizeBytes) {
    return { 
      isValid: false, 
      error: `File size must be less than ${Math.round(maxSizeBytes / 1024 / 1024)}MB` 
    };
  }

  if (file.type && allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `File type must be one of: ${allowedTypes.join(', ')}` 
    };
  }

  return { isValid: true };
};

// Export default for easy importing
export default {
  // S3 operations
  getPresignedUrls,
  uploadImagesToS3,
  uploadImages,
  uploadSingleImage,
  
  // File validation
  validateImageFile,
};