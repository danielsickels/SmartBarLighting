import getHeaders from "@/lib/utils";
import { API_ENDPOINTS } from "@/lib/config";

export interface SpiritType {
  id: number;
  name: string;
}

export const fetchAllSpiritTypes = async (): Promise<SpiritType[]> => {
  try {
    const headers = await getHeaders();
    const res = await fetch(API_ENDPOINTS.SPIRIT_TYPES, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      throw new Error("Failed to fetch spirit types");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching spirit types:", error);
    throw error;
  }
};

// Add a new spirit type
export const addSpiritType = async (spiritType: {
  name: string;
}): Promise<SpiritType> => {
  try {
    const headers = await getHeaders();
    const res = await fetch(API_ENDPOINTS.SPIRIT_TYPES, {
      method: "POST",
      headers,
      body: JSON.stringify(spiritType),
    });
    if (!res.ok) {
      throw new Error("Failed to add spirit type");
    }
    return await res.json();
  } catch (error) {
    console.error("Error adding spirit type:", error);
    throw error;
  }
};
