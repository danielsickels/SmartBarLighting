import getHeaders from "@/lib/utils";
import { API_ENDPOINTS } from "@/lib/config";

export interface BarcodeRegistryData {
  id: number;
  barcode: string;
  name: string;
  brand: string | null;
  flavor_profile: string | null;
  capacity_ml: number | null;
  spirit_type_name: string | null;
  created_at: string | null;
}

export interface BarcodeLookupResponse {
  found: boolean;
  data: BarcodeRegistryData | null;
  message: string | null;
}

export interface BarcodeRegisterRequest {
  barcode: string;
  name: string;
  brand?: string;
  flavor_profile?: string;
  capacity_ml?: number;
  spirit_type_name?: string;
}

/**
 * Look up a barcode in the global registry
 */
export const lookupBarcode = async (
  barcode: string
): Promise<BarcodeLookupResponse> => {
  const headers = await getHeaders();
  const res = await fetch(`${API_ENDPOINTS.BARCODE.LOOKUP}/${encodeURIComponent(barcode)}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    throw new Error("Failed to lookup barcode");
  }

  return await res.json();
};

/**
 * Register a barcode with bottle information
 */
export const registerBarcode = async (
  data: BarcodeRegisterRequest
): Promise<BarcodeRegistryData> => {
  const headers = await getHeaders();
  const res = await fetch(API_ENDPOINTS.BARCODE.REGISTER, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to register barcode");
  }

  return await res.json();
};

