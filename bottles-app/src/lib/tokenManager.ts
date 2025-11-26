import { API_ENDPOINTS } from "./config";

interface TokenData {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Store tokens in localStorage
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem("access_token");
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem("refresh_token");
};

/**
 * Clear all tokens from localStorage
 */
export const clearTokens = (): void => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

/**
 * Decode JWT token to get expiration time
 */
export const getTokenExpiration = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch {
    return null;
  }
};

/**
 * Check if token is expired or will expire in the next 5 minutes
 */
export const isTokenExpiringSoon = (token: string): boolean => {
  const exp = getTokenExpiration(token);
  if (!exp) return true;
  
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  return exp - now < fiveMinutes;
};

/**
 * Refresh the access token using the refresh token
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data: TokenData = await response.json();
    setTokens(data.access_token, data.refresh_token);
    
    return data.access_token;
  } catch (error) {
    console.error("Token refresh failed:", error);
    clearTokens();
    return null;
  }
};

/**
 * Subscribe to token refresh events
 */
const subscribeTokenRefresh = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

/**
 * Notify all subscribers of new token
 */
const onTokenRefreshed = (token: string): void => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * Get a valid access token, refreshing if necessary
 * Handles concurrent refresh requests
 */
export const getValidAccessToken = async (): Promise<string | null> => {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    return null;
  }

  // If token is not expiring soon, return it
  if (!isTokenExpiringSoon(accessToken)) {
    return accessToken;
  }

  // If already refreshing, wait for the refresh to complete
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((newToken: string) => {
        resolve(newToken);
      });
    });
  }

  // Start refreshing
  isRefreshing = true;

  try {
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      onTokenRefreshed(newToken);
      return newToken;
    }
    
    return null;
  } finally {
    isRefreshing = false;
  }
};

