"use client";

import { useState, useEffect, useRef } from "react";
import AuthGuard from "../components/AuthGuard";
import AddBottleForm from "../components/AddBottleForm";
import FetchAllBottles from "../components/FetchAllBottles";
import FetchAllRecipes from "../components/FetchAllRecipes";
import AddRecipeForm from "../components/AddRecipeForm";
import HamburgerNav from "../components/HamburgerNav";
import ScrollToTop from "@/components/ScrollToTop";
import { Bottle } from "../services/bottleService";
import { Recipe } from "../services/recipeService";

const NAV_ITEMS = [
  { id: "fetchAll", label: "Fetch All Bottles" },
  { id: "addBottle", label: "Add Bottle" },
  { id: "fetchAllRecipes", label: "Fetch All Recipes" },
  { id: "addRecipe", label: "Add Recipe" },
];

export default function Home() {
  const [activeContent, setActiveContent] = useState<string | null>(null);
  const [editingBottle, setEditingBottle] = useState<Bottle | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Scroll to top when active content changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [activeContent]);

  const handleNavClick = (contentType: string) => {
    // Clear edit state when switching views
    setEditingBottle(null);
    setEditingRecipe(null);
    setActiveContent(contentType);
  };

  const handleEditBottle = (bottle: Bottle) => {
    setEditingBottle(bottle);
    setActiveContent("addBottle");
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setActiveContent("addRecipe");
  };

  const renderMainContent = () => {
    switch (activeContent) {
      case "fetchAll":
        return <FetchAllBottles onEdit={handleEditBottle} />;
      case "addBottle":
        return (
          <AddBottleForm
            editBottle={editingBottle}
            onEditComplete={() => {
              setEditingBottle(null);
              setActiveContent("fetchAll");
            }}
          />
        );
      case "fetchAllRecipes":
        return <FetchAllRecipes onEdit={handleEditRecipe} />;
      case "addRecipe":
        return (
          <AddRecipeForm
            editRecipe={editingRecipe}
            onEditComplete={() => {
              setEditingRecipe(null);
              setActiveContent("fetchAllRecipes");
            }}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-center text-amber-400 text-xl">
              <span className="glow-charcoal">
                Select an action from the menu to get started.
              </span>
            </p>
          </div>
        );
    }
  };

  const isEditing = editingBottle !== null || editingRecipe !== null;

  return (
    <AuthGuard>
      <div
        ref={mainContentRef}
        className="relative min-h-screen overflow-auto scrollbar-hide"
      >
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

        {/* Hamburger Navigation */}
        <HamburgerNav
          navItems={NAV_ITEMS}
          activeContent={activeContent}
          onNavClick={handleNavClick}
          disabled={isEditing}
        />

        {/* Dark overlay when editing */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/80 z-50 transition-opacity duration-300" />
        )}

        {/* Main content */}
        <main
          className={`relative z-20 w-full px-4 sm:px-6 lg:px-8 pt-20 pb-12 ${
            isEditing ? "relative z-[60]" : ""
          }`}
        >
          <div className="max-w-7xl mx-auto">{renderMainContent()}</div>
        </main>

        <ScrollToTop scrollContainerRef={mainContentRef as React.RefObject<HTMLElement | null>} />
      </div>
    </AuthGuard>
  );
}
