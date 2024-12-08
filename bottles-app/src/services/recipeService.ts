export interface Recipe {
  id: number;
  name: string;
  instructions: string;
  ingredients: string; 
  spirit_type_ids: number[]; 
  spirit_types: { id: number; name: string }[]; 
  bottles: { id: number; name: string }[]; 
}

export interface RecipeCreate {
  name: string;
  instructions: string;
  ingredients: string;
  spirit_type_ids: number[];
}

export const addRecipe = async (recipe: RecipeCreate): Promise<Recipe> => {
  try {
    const res = await fetch('http://localhost:8000/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipe),
    });

    if (!res.ok) {
      throw new Error('Failed to add recipe');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error;
  }
};

export const fetchAllRecipes = async (): Promise<Recipe[]> => {
  try {
    const res = await fetch('http://localhost:8000/recipes');
    if (!res.ok) {
      throw new Error('Failed to fetch recipes');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
};

export const fetchRecipe = async (id: number): Promise<Recipe | null> => {
  try {
    const res = await fetch(`http://localhost:8000/recipes/${id}`);
    if (!res.ok) {
      throw new Error('Recipe not found');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching recipe by ID:', error);
    return null;
  }
};

export const deleteRecipe = async (id: number): Promise<void> => {
  try {
    const res = await fetch(`http://localhost:8000/recipes/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error('Failed to delete recipe');
    }
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};
