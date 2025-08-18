// src/services/RequestService.ts
import { Configuration } from "../generated";
import { getIdToken } from "./CognitoService";

// ================== API ENDPOINT CONSTANTS ==================
const REQUEST_API_BASE = "https://yvj4ov9377.execute-api.eu-west-2.amazonaws.com/requestsCRUD"; // Replace with your actual API Gateway base URL

// ================== INTERFACES ==================
export interface AdoptionRequest {
  requestId: string;
  createdAt: string;
  adopterId: string;
  dogId: string;
  dogCreatedAt: string;
  shelterId: string;
  status: "pending" | "approved" | "rejected" | "withdrawn";
}

// ================== HELPERS ==================
const withAuthHeaders = async () => {
  const token = await getIdToken();
  if (!token) throw new Error("No token available");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// ================== FUNCTIONS ==================
export async function createAdoptionRequest(dogId: string, dogCreatedAt: string, shelterId: string): Promise<AdoptionRequest> {
  const headers = await withAuthHeaders();
  const response = await fetch(`${REQUEST_API_BASE}/request`, {
    method: "POST",
    headers,
    body: JSON.stringify({ dogId, dogCreatedAt, shelterId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create adoption request: ${await response.text()}`);
  }
  return response.json();
}

export async function getAdoptionRequests(): Promise<AdoptionRequest[]> {
  const headers = await withAuthHeaders();
  const response = await fetch(`${REQUEST_API_BASE}/request`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch adoption requests: ${await response.text()}`);
  }

  // Items are in DynamoDB wire format if you didn’t unmarshall in Lambda
  // If you DID unmarshall in Lambda, you can just return response.json()
  const data = await response.json();
  return data.map((item: any) => ({
    requestId: item.request_id.S,
    createdAt: item.created_at.S,
    adopterId: item.adopter_id.S,
    dogId: item.dog_id.S,
    dogCreatedAt: item.dog_created_at.S,
    shelterId: item.shelter_id.S,
    status: item.status.S,
  }));
}

export async function updateAdoptionRequestStatus(requestId: string, createdAt: string, status: AdoptionRequest["status"]): Promise<void> {
  const headers = await withAuthHeaders();
  const response = await fetch(`${REQUEST_API_BASE}/request`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ requestId, createdAt, status }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update request status: ${await response.text()}`);
  }
}

export async function deleteAdoptionRequest(requestId: string, createdAt: string): Promise<void> {
  const headers = await withAuthHeaders();
  const response = await fetch(`${REQUEST_API_BASE}/request`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ requestId, createdAt }),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete adoption request: ${await response.text()}`);
  }
}
