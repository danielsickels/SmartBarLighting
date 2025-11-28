"use client";

import { useState, useEffect, useRef } from "react";
import AuthGuard from "../components/AuthGuard";
import AddBottleForm from "../components/AddBottleForm";
import FetchAllBottles from "../components/FetchAllBottles";
import FetchAllRecipes from "../components/FetchAllRecipes";
import AddRecipeForm from "../components/AddRecipeForm";
import LogoutButton from "@/components/LogoutButton";
import { Bottle } from "../services/bottleService";

interface Recipe {
  id: number;
  name: string;
  instructions: string;
  ingredients: string;
  spirit_type_ids: number[];
  spirit_types: { id: number; name: string }[];
}

export default function Home() {
  const [activeContent, setActiveContent] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [editingBottle, setEditingBottle] = useState<Bottle | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Scroll to top when active content changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [activeContent]);

  const toggleContent = (contentType: string) => {
    // Clear edit state when switching views
    setEditingBottle(null);
    setEditingRecipe(null);
    
    // Always set the content (don't toggle off if clicking same button)
    setActiveContent(contentType);
    setSidebarOpen(false);
  };

  const handleEditBottle = (bottle: Bottle) => {
    setEditingBottle(bottle);
    setActiveContent("addBottle");
    setSidebarOpen(false);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setActiveContent("addRecipe");
    setSidebarOpen(false);
  };

  const renderMainContent = () => {
    switch (activeContent) {
      case "fetchAll":
        return <FetchAllBottles onEdit={handleEditBottle} />;
      case "addBottle":
        return (
          <div className="max-w-full mx-auto p-4">
            <AddBottleForm 
              editBottle={editingBottle} 
              onEditComplete={() => {
                setEditingBottle(null);
                setActiveContent("fetchAll");
              }}
            />
          </div>
        );
      case "fetchAllRecipes":
        return <FetchAllRecipes onEdit={handleEditRecipe} />;
      case "addRecipe":
        return (
          <div className="max-w-full mx-auto p-4">
            <AddRecipeForm 
              editRecipe={editingRecipe}
              onEditComplete={() => {
                setEditingRecipe(null);
                setActiveContent("fetchAllRecipes");
              }}
            />
          </div>
        );
      default:
        return (
          <p className="text-center text-amber-400 pt-6">
            <span className="glow-charcoal">
              Select an action to display its content here.
            </span>
          </p>
        );
    }
  };

  return (
    <AuthGuard>
      <div ref={mainContentRef} className="relative flex h-screen overflow-auto scrollbar-hide">
        {/* Background image */}
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: "url('/manybarrels.webp')",
            backgroundRepeat: "repeat",
            backgroundSize: "auto",
            backgroundAttachment: "fixed",
          }}
        />
        {/* Dark overlay on background */}
        <div className="fixed inset-0 bg-black/30 z-10" />
        
        {/* Content wrapper */}
        <div className="relative z-20 flex w-full h-full">
        <div className="md:hidden bg-gray-900 p-0">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="md:hidden fixed bottom-4 right-4 bg-emerald-700 text-white py-2 px-4 rounded-lg z-[70] hover:bg-emerald-800"
          >
            {isSidebarOpen ? "Close Menu" : "Open Menu"}
          </button>
        </div>

        {/* Sidebar */}
        <div
          className={`fixed top-0 bottom-0 left-0 transition-transform duration-300 z-40
  ${
    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
  } md:translate-x-0 md:w-1/4`}
        >
          {/* Sidebar background image */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: "url('/manybarrels.webp')",
              backgroundRepeat: "repeat",
              backgroundSize: "auto",
            }}
          />
          {/* Sidebar dark overlay */}
          <div className="absolute inset-0 bg-black/30 z-10" />
          
          {/* Sidebar content wrapper - centers vertically */}
          <div className={`relative z-20 h-full flex items-center py-8 pb-20 md:pb-10 lg:pb-20 ${
            editingBottle || editingRecipe ? "pointer-events-none" : ""
          }`}>
            {/* Scrollable content area - only scrolls if overflow */}
            <div className="w-full max-h-full overflow-y-auto scrollbar-hide px-8 space-y-4 pb-16 md:pb-4 lg:pb-16">
          <h1 className="text-2xl md:text-xl lg:text-2xl font-bold mb-8 md:mb-1 lg:mb-8 text-center text-amber-500">
            Actions
          </h1>
          <button
            onClick={() => toggleContent("fetchAll")}
            className={`w-full px-4 py-2 md:px-3 md:py-1.5 md:text-sm lg:px-4 lg:py-2 lg:text-base rounded-lg mb-2 bg-gray-900 text-amber-500 font-bold shadow-[0_0_10px_2px_rgba(153,102,0,0.6)] transition-all ${
              activeContent === "fetchAll"
                ? "shadow-[0_0_20px_4px_rgba(153,102,0,0.8)]"
                : "hover:shadow-[0_0_20px_4px_rgba(153,102,0,0.8)]"
            }`}
          >
            Fetch All Bottles
          </button>
          <button
            onClick={() => toggleContent("addBottle")}
            className={`w-full px-4 py-2 md:px-3 md:py-1.5 md:text-sm lg:px-4 lg:py-2 lg:text-base rounded-lg mb-2 bg-gray-900 text-amber-500 font-bold shadow-[0_0_10px_2px_rgba(153,102,0,0.6)] transition-all ${
              activeContent === "addBottle"
                ? "shadow-[0_0_20px_4px_rgba(153,102,0,0.8)]"
                : "hover:shadow-[0_0_20px_4px_rgba(153,102,0,0.8)]"
            }`}
          >
            Add Bottle
          </button>
          <button
            onClick={() => toggleContent("fetchAllRecipes")}
            className={`w-full px-4 py-2 md:px-3 md:py-1.5 md:text-sm lg:px-4 lg:py-2 lg:text-base rounded-lg mb-2 bg-gray-900 text-amber-500 font-bold shadow-[0_0_10px_2px_rgba(153,102,0,0.6)] transition-all ${
              activeContent === "fetchAllRecipes"
                ? "shadow-[0_0_20px_4px_rgba(153,102,0,0.8)]"
                : "hover:shadow-[0_0_20px_4px_rgba(153,102,0,0.8)]"
            }`}
          >
            Fetch All Recipes
          </button>
          <button
            onClick={() => toggleContent("addRecipe")}
            className={`w-full px-4 py-2 md:px-3 md:py-1.5 md:text-sm lg:px-4 lg:py-2 lg:text-base rounded-lg bg-gray-900 text-amber-500 font-bold shadow-[0_0_10px_2px_rgba(153,102,0,0.6)] transition-all ${
              activeContent === "addRecipe"
                ? "shadow-[0_0_20px_4px_rgba(153,102,0,0.8)]"
                : "hover:shadow-[0_0_20px_4px_rgba(153,102,0,0.8)]"
            }`}
          >
            Add Recipe
          </button>
          <div className={`fixed bottom-4 left-4 ${
            editingBottle || editingRecipe ? "z-[70] pointer-events-auto" : "z-20"
          }`}>
            <LogoutButton />
          </div>
          </div> {/* Close scrollable content area */}
          </div> {/* Close sidebar content wrapper */}
        </div>

        {/* Dark overlay when editing - covers everything including sidebar */}
        {(editingBottle || editingRecipe) && (
          <div className="fixed inset-0 bg-black/80 z-50 transition-opacity duration-300" />
        )}

        {/* Main content */}
        <div
          className={`flex-grow pt-8 pb-12 transition-all ${
            isSidebarOpen ? "ml-0" : "md:ml-[25%]"
          } ${editingBottle || editingRecipe ? "relative z-[60]" : ""}`}
        >
          <div className="p-4">{renderMainContent()}</div>
        </div>
        </div> {/* Close content wrapper */}
      </div>
    </AuthGuard>
  );
}
