
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

global.Buffer = Buffer;

export async function getPresignedUrls(fileCount: number, token: string): Promise<{ uploadUrls: string[], keys: string[] }> {
  const response = await fetch('https://nwmkpbnrrh.execute-api.eu-west-2.amazonaws.com/default/PresignImageUrls', {
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
  console.log('Presigned URL response:', json); // 🔍 Add this

  // Make sure to return the correct keys based on what's in `json`
  const uploadUrls = json.uploadUrls ?? json.urls ?? [];
  const keys = json.keys ?? [];

  return { uploadUrls, keys };
}




export async function uploadImagesToS3(uris: string[], urls: string[]) {
  const uploads = uris.map((uri, i) => {
    return fetch(uri)
      .then(res => res.blob())
      .then(blob =>
        fetch(urls[i], {
          method: 'PUT',
          headers: {
            'Content-Type': 'image/jpeg',
          },
          body: blob,
        })
      );
  });

  const results = await Promise.all(uploads);
  const failed = results.filter(r => !r.ok);
  if (failed.length > 0) throw new Error("One or more uploads failed.");
}









export async function uploadDogProfile(data: any, token: string) {
  const response = await fetch('https://ghjg31mre8.execute-api.eu-west-2.amazonaws.com/default/CreateDogEntryFunction', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response;
}


