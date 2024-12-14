"use client";

import { useState } from "react";
import AuthGuard from "../components/AuthGuard"; // Import AuthGuard
import FetchBottleButton from "../components/FetchBottleButton";
import AddBottleForm from "../components/AddBottleForm";
import FetchAllBottles from "../components/FetchAllBottles";
import FetchAllRecipes from "../components/FetchAllRecipes";
import AddRecipeForm from "../components/AddRecipeForm";

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
        return (
          <div className="max-w-full mx-auto p-4">
            <AddBottleForm />
          </div>
        );
      case "fetchAllRecipes":
        return <FetchAllRecipes />;
      case "addRecipe":
        return (
          <div className="max-w-full mx-auto p-4">
            <AddRecipeForm />
          </div>
        );
      default:
        return <p className="text-center pt-6">Select an action to display its content here.</p>;
    }
  };

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-auto scrollbar-hide">
        {/* Sidebar */}
        <div className="w-1/4 bg-gray-100 p-8 space-y-4 fixed overflow-y-auto pt-28">
          <h1 className="text-2xl font-bold mb-8 text-center">Actions</h1>
          {/* Buttons */}
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
            onClick={() => toggleContent("fetchAllRecipes")}
            className={`w-full px-4 py-2 rounded-lg mb-2 ${
              activeContent === "fetchAllRecipes" ? "bg-purple-700 text-white" : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            Fetch All Recipes
          </button>
          <button
            onClick={() => toggleContent("addRecipe")}
            className={`w-full px-4 py-2 rounded-lg ${
              activeContent === "addRecipe" ? "bg-red-700 text-white" : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            Add Recipe
          </button>
        </div>

        {/* Main content */}
        <div className="flex-grow ml-[25%] pt-20 pb-12 relative">
          <div className="p-4">{renderMainContent()}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
