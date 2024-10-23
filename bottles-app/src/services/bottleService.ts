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
        throw new Error(`Failed to fetch bottle with id ${id}`);
      }
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error fetching the bottle:', error);
      return null;
    }
  };
  