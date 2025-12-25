// API Configuration
export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://backend-barapp.dannysickels.com"
    : "http://localhost:8000";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
  },
  BOTTLES: `${API_BASE_URL}/bottles`,
  BOTTLE_IMPORT: `${API_BASE_URL}/bottles/import`,
  BARCODE: {
    LOOKUP: `${API_BASE_URL}/barcode/lookup`,
    REGISTER: `${API_BASE_URL}/barcode/register`,
  },
  RECIPES: `${API_BASE_URL}/recipes`,
  SPIRIT_TYPES: `${API_BASE_URL}/spirit_types`,
} as const;
