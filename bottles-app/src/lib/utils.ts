import { getValidAccessToken } from "./tokenManager";

/**
 * Get headers for API requests with valid access token
 * Automatically refreshes token if needed
 */
const getHeaders = async (): Promise<HeadersInit> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const token = await getValidAccessToken();
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export default getHeaders;
