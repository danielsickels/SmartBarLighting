import getHeaders from "@/lib/utils";

export interface SpiritType {
  id: number;
  name: string;
}

export const fetchAllSpiritTypes = async (): Promise<SpiritType[]> => {
  try {
    const res = await fetch(
      `https://backend-barapp.dannysickels.com/spirit_types`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
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
    const res = await fetch(
      `https://backend-barapp.dannysickels.com/spirit_types`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(spiritType),
      }
    );
    if (!res.ok) {
      throw new Error("Failed to add spirit type");
    }
    return await res.json();
  } catch (error) {
    console.error("Error adding spirit type:", error);
    throw error;
  }
};
