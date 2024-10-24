// bottleService.ts

export interface Bottle {
  id: number;
  name: string;
  material: string;
  capacity_ml: number;
}

export const fetchBottle = async (id: number): Promise<Bottle | null> => {
  try {
    const res = await fetch(`http://localhost:8000/bottles/${id}`);
    if (!res.ok) {
      throw new Error('Bottle not found');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching bottle by ID:', error);
    return null;
  }
};

// Define the fetchBottleByName function here
export const fetchBottleByName = async (name: string): Promise<Bottle[] | null> => {
  try {
    const res = await fetch(`http://localhost:8000/bottles?name=${encodeURIComponent(name.trim())}`);
    if (!res.ok) {
      throw new Error('Bottle not found');
    }
    const data = await res.json();
    return data; // Expecting an array from the API
  } catch (error) {
    console.error('Error fetching bottle by name:', error);
    return null;
  }
};
