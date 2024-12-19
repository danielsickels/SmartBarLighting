import getHeaders from "@/lib/utils";

export interface Bottle {
  id: number;
  name: string;
  brand: string | null;
  flavor_profile: string | null;
  spirit_type_id: number;
  spirit_type?: { id: number; name: string };
  capacity_ml: number;
}

export interface BottleCreate {
  name: string;
  brand?: string;
  flavor_profile?: string;
  spirit_type_id: number;
  capacity_ml: number;
}

export const fetchBottle = async (id: number): Promise<Bottle | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/bottles/${id}`,
      {
        headers: getHeaders(),
      }
    );
    if (!res.ok) {
      throw new Error("Bottle not found");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching bottle by ID:", error);
    return null;
  }
};

export const fetchBottleByName = async (
  name: string
): Promise<Bottle[] | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/bottles?name=${encodeURIComponent(
        name.trim()
      )}`,
      {
        headers: getHeaders(),
      }
    );
    if (!res.ok) {
      throw new Error("Bottle not found");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching bottle by name:", error);
    return null;
  }
};

export const addBottle = async (bottle: BottleCreate): Promise<Bottle> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/bottles`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(bottle),
    });

    if (!res.ok) {
      throw new Error("Failed to add bottle");
    }

    return await res.json();
  } catch (error) {
    console.error("Error adding bottle:", error);
    throw error;
  }
};

export const deleteBottle = async (id: number): Promise<void> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/bottles/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to delete bottle");
    }
  } catch (error) {
    console.error("Error deleting bottle:", error);
    throw error;
  }
};

export const fetchAllBottles = async (
  skip: number = 0,
  limit: number = 1000
): Promise<Bottle[]> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/bottles?skip=${skip}&limit=${limit}`,
      {
        headers: getHeaders(),
      }
    );
    if (!res.ok) {
      throw new Error("Failed to fetch bottles");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching all bottles:", error);
    throw error;
  }
};
