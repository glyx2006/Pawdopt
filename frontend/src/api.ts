import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { Configuration } from '../generated';
import { getIdToken } from '../services/CognitoService';

global.Buffer = Buffer;

// ================== API ENDPOINT CONSTANTS ==================
const API_ENDPOINTS = {
  PRESIGN_IMAGE_URLS: 'https://1g53nof6f8.execute-api.eu-west-2.amazonaws.com/presignImageUrls',
  DOG_API_BASE: 'https://m4gwfeebyk.execute-api.eu-west-2.amazonaws.com',
} as const;

// ================== FUNCTIONS ==================
export async function getPresignedUrls(fileCount: number, token: string): Promise<{ uploadUrls: string[], keys: string[] }> {
  const response = await fetch(API_ENDPOINTS.PRESIGN_IMAGE_URLS, {
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
}

export async function uploadImagesToS3(uris: string[], urls: string[]) {
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
}

export async function uploadDogProfile(data: any, token: string) {
  const response = await fetch(`${API_ENDPOINTS.DOG_API_BASE}/dog`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response;
}

export async function deleteDog(dogId: string, dogCreatedAt: string, token: string) {
  const response = await fetch(`${API_ENDPOINTS.DOG_API_BASE}/dog/${dogId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-created-at': dogCreatedAt,
    },
  });

  return response;
}

export async function updateDogProfile(dogId: string, data: any, token: string) {
  console.log('Frontend updating dog with this data:', JSON.stringify(data, null, 2));
  
  const response = await fetch(`${API_ENDPOINTS.DOG_API_BASE}/dog/${dogId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response;
}

export const dogApiConfig = new Configuration({
  basePath: API_ENDPOINTS.DOG_API_BASE,
  accessToken: getIdToken(),
});

export const swipeApiConfig = new Configuration({
  basePath: 'https://yvj4ov9377.execute-api.eu-west-2.amazonaws.com',
  accessToken: getIdToken()
})