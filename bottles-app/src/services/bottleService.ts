// bottleService.ts

export interface Bottle {
  id: number;
  name: string;
  brand: string; // New field for brand
  flavor_profile: string; // New field for flavor profile
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

export const fetchBottleByName = async (name: string): Promise<Bottle[] | null> => {
  try {
    const res = await fetch(`http://localhost:8000/bottles?name=${encodeURIComponent(name.trim())}`);
    if (!res.ok) {
      throw new Error('Bottle not found');
    }
    const data = await res.json();
    return data; 
  } catch (error) {
    console.error('Error fetching bottle by name:', error);
    return null;
  }
};

export const addBottle = async (bottle: Partial<Bottle>): Promise<Bottle> => {
  try {
    const res = await fetch('http://localhost:8000/bottles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bottle),
    });
    
    if (!res.ok) {
      throw new Error('Failed to add bottle');
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error adding bottle:', error);
    throw error;
  }
};

export const deleteBottle = async (id: number): Promise<void> => {
  try {
    const res = await fetch(`http://localhost:8000/bottles/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error('Failed to delete bottle');
    }
  } catch (error) {
    console.error('Error deleting bottle:', error);
    throw error;
  }
};

export const fetchAllBottles = async (): Promise<Bottle[]> => {
  try {
    const res = await fetch('http://localhost:8000/bottles?skip=0&limit=1000');
    if (!res.ok) {
      throw new Error('Failed to fetch bottles');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching all bottles:', error);
    throw error;
  }
};
