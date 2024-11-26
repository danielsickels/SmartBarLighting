"use client";

import { useState } from 'react';
import FetchBottleButton from '../components/FetchBottleButton';
import AddBottleForm from '../components/AddBottleForm';
import FetchAllBottles from '../components/FetchAllBottles';
import FetchAllRecipes from '../components/FetchAllRecipes'; // New import
import AddRecipeForm from '../components/AddRecipeForm'; // New import

export default function Home() {
  const [activeContent, setActiveContent] = useState<string | null>(null);

  const toggleContent = (contentType: string) => {
    setActiveContent((prevContent) => (prevContent === contentType ? null : contentType));
  };

  const renderMainContent = () => {
    switch (activeContent) {
      case "fetchAll":
        return <FetchAllBottles />;
      case "fetchSingle":
        return <FetchBottleButton />;
      case "addBottle":
        return <AddBottleForm />;
      case "fetchAllRecipes": // New case
        return <FetchAllRecipes />;
      case "addRecipe": // New case
        return <AddRecipeForm />;
      default:
        return <p className="text-center">Select an action to display its content here.</p>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for actions, fixed on the left */}
      <div className="w-1/4 bg-gray-100 p-8 space-y-4 fixed top-20 bottom-12 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">Actions</h1>

        <button
          onClick={() => toggleContent("fetchSingle")}
          className={`w-full px-4 py-2 rounded-lg mb-2 ${
            activeContent === "fetchSingle" ? "bg-blue-700 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Fetch Single Bottle
        </button>

        <button
          onClick={() => toggleContent("fetchAll")}
          className={`w-full px-4 py-2 rounded-lg mb-2 ${
            activeContent === "fetchAll" ? "bg-green-700 text-white" : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          Fetch All Bottles
        </button>

        <button
          onClick={() => toggleContent("addBottle")}
          className={`w-full px-4 py-2 rounded-lg mb-2 ${
            activeContent === "addBottle" ? "bg-gray-700 text-white" : "bg-gray-600 text-white hover:bg-gray-700"
          }`}
        >
          Add Bottle
        </button>

        <button
          onClick={() => toggleContent("fetchAllRecipes")} // New button for fetching all recipes
          className={`w-full px-4 py-2 rounded-lg mb-2 ${
            activeContent === "fetchAllRecipes" ? "bg-purple-700 text-white" : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          Fetch All Recipes
        </button>

        <button
          onClick={() => toggleContent("addRecipe")} // New button for adding a recipe
          className={`w-full px-4 py-2 rounded-lg ${
            activeContent === "addRecipe" ? "bg-red-700 text-white" : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          Add Recipe
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-grow ml-[25%] overflow-y-auto pt-20 pb-12 relative">
        <div className="mt-24 p-4">{renderMainContent()}</div>
      </div>
    </div>
  );
}
