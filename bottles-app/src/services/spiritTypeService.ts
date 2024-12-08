export interface SpiritType {
  id: number;
  name: string;
}

export const fetchAllSpiritTypes = async (): Promise<SpiritType[]> => {
  try {
    const res = await fetch('http://localhost:8000/spirit_types');
    if (!res.ok) {
      throw new Error('Failed to fetch spirit types');
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching spirit types:', error);
    throw error;
  }
};

// Add a new spirit type
export const addSpiritType = async (spiritType: { name: string }): Promise<SpiritType> => {
  try {
    const res = await fetch('http://localhost:8000/spirit_types', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(spiritType),
    });
    if (!res.ok) {
      throw new Error('Failed to add spirit type');
    }
    return await res.json();
  } catch (error) {
    console.error('Error adding spirit type:', error);
    throw error;
  }
};
