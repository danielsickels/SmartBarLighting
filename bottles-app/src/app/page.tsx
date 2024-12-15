"use client";

import { useState } from "react";
import AuthGuard from "../components/AuthGuard";
import AddBottleForm from "../components/AddBottleForm";
import FetchAllBottles from "../components/FetchAllBottles";
import FetchAllRecipes from "../components/FetchAllRecipes";
import AddRecipeForm from "../components/AddRecipeForm";
import LogoutButton from "@/components/LogoutButton";

export default function Home() {
  const [activeContent, setActiveContent] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleContent = (contentType: string) => {
    setActiveContent((prevContent) =>
      prevContent === contentType ? null : contentType
    );
    setSidebarOpen(false);
  };

  const renderMainContent = () => {
    switch (activeContent) {
      case "fetchAll":
        return <FetchAllBottles />;
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
        return (
          <p className="text-center pt-6">
            Select an action to display its content here.
          </p>
        );
    }
  };

  return (
    <AuthGuard>
      <div
        className="flex h-screen overflow-auto"
        style={{
          backgroundImage: "url('/manybarrels.webp')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
        }}
      >
        <div className="md:hidden bg-gray-100 p-0">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="md:hidden fixed top-4 left-4 bg-blue-600 text-white py-2 px-4 rounded-lg z-50"
          >
            {isSidebarOpen ? "Close Menu" : "Open Menu"}
          </button>
        </div>

        {/* Sidebar */}
        <div
          className={`fixed top-0 bottom-0 left-0 bg-gray-100 p-8 space-y-4 transition-transform duration-300 z-40 
          ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:w-1/4 overflow-y-auto pt-28`}
          style={{
            backgroundImage: "url('/manybarrels.webp')", // Set the gunmetal background for the sidebar
            backgroundRepeat: "repeat", // Make the background repeat
            backgroundSize: "auto", // Shrink the tile size for the sidebar
          }}
        >
          <h1 className="text-2xl font-bold mb-8 text-center">Actions</h1>
          <button
            onClick={() => toggleContent("fetchAll")}
            className={`w-full px-4 py-2 rounded-lg mb-2 ${
              activeContent === "fetchAll"
                ? "bg-green-700 text-white"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Fetch All Bottles
          </button>
          <button
            onClick={() => toggleContent("addBottle")}
            className={`w-full px-4 py-2 rounded-lg mb-2 ${
              activeContent === "addBottle"
                ? "bg-gray-700 text-white"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
          >
            Add Bottle
          </button>
          <button
            onClick={() => toggleContent("fetchAllRecipes")}
            className={`w-full px-4 py-2 rounded-lg mb-2 ${
              activeContent === "fetchAllRecipes"
                ? "bg-purple-700 text-white"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            Fetch All Recipes
          </button>
          <button
            onClick={() => toggleContent("addRecipe")}
            className={`w-full px-4 py-2 rounded-lg ${
              activeContent === "addRecipe"
                ? "bg-red-700 text-white"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            Add Recipe
          </button>
          <div className="fixed bottom-4 left-4">
            <LogoutButton />
          </div>
        </div>

        {/* Main content */}
        <div
          className={`flex-grow pt-20 pb-12 transition-all ${
            isSidebarOpen ? "ml-0" : "md:ml-[25%]"
          }`}
        >
          <div className="p-4">{renderMainContent()}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
