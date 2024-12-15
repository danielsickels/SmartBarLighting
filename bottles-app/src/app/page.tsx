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
        <div className="md:hidden bg-gray-900 p-0">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="md:hidden fixed top-4 left-4 bg-emerald-700 text-white py-2 px-4 rounded-lg z-50 hover:bg-emerald-800"
          >
            {isSidebarOpen ? "Close Menu" : "Open Menu"}
          </button>
        </div>

        {/* Sidebar */}
        <div
          className={`fixed top-0 bottom-0 left-0 bg-gray-800 p-8 space-y-4 transition-transform duration-300 z-40 
  ${
    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
  } md:translate-x-0 md:w-1/4 overflow-y-auto pt-28`}
          style={{
            backgroundImage: "url('/manybarrels.webp')",
            backgroundRepeat: "repeat",
            backgroundSize: "auto",
          }}
        >
          <h1 className="text-2xl font-bold mb-8 text-center text-amber-500">
            Actions
          </h1>
          <button
            onClick={() => toggleContent("fetchAll")}
            className={`w-full px-4 py-2 rounded-lg mb-2 bg-gray-900 text-amber-500 font-bold shadow-[0_0_5px_1px_rgba(153,102,0,0.3)] transition-all ${
              activeContent === "fetchAll"
                ? "shadow-[0_0_20px_4px_rgba(153,102,0,0.8)]"
                : "hover:shadow-[0_0_20px_4px_rgba(153,102,0,0.8)]"
            }`}
          >
            Fetch All Bottles
          </button>
          <button
            onClick={() => toggleContent("addBottle")}
            className={`w-full px-4 py-2 rounded-lg mb-2 bg-gray-900 text-amber-500 font-bold shadow-[0_0_5px_1px_rgba(153,102,0,0.3)] transition-all ${
              activeContent === "addBottle"
                ? "shadow-[0_0_20px_4px_rgba(153,102,0,0.8)]"
                : "hover:shadow-[0_0_20px_4px_rgba(153,102,0,0.8)]"
            }`}
          >
            Add Bottle
          </button>
          <button
            onClick={() => toggleContent("fetchAllRecipes")}
            className={`w-full px-4 py-2 rounded-lg mb-2 bg-gray-900 text-amber-500 font-bold shadow-[0_0_5px_1px_rgba(153,102,0,0.3)] transition-all ${
              activeContent === "fetchAllRecipes"
                ? "shadow-[0_0_20px_4px_rgba(153,102,0,0.8)]"
                : "hover:shadow-[0_0_20px_4px_rgba(153,102,0,0.8)]"
            }`}
          >
            Fetch All Recipes
          </button>
          <button
            onClick={() => toggleContent("addRecipe")}
            className={`w-full px-4 py-2 rounded-lg bg-gray-900 text-amber-500 font-bold shadow-[0_0_5px_1px_rgba(153,102,0,0.3)] transition-all ${
              activeContent === "addRecipe"
                ? "shadow-[0_0_20px_4px_rgba(153,102,0,0.8)]"
                : "hover:shadow-[0_0_20px_4px_rgba(153,102,0,0.8)]"
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
