# SmartBarLighting
## Please visit https://barapp.dannysickels.com/ for the live demo!
  
SmartBarLighting is a personal project designed to manage and display your collection of spirits and cocktail recipes. The application currently serves as a database for cataloging your bottles and recipes, with future plans to incorporate a lighting system to assist in locating bottles in your bar setup.

## Features
Bottle Database: Keep an organized record of your spirits collection, including details such as name, type, brand, and more.
Cocktail Recipes: Store and manage your favorite cocktail recipes, complete with ingredients and preparation steps.
Future Enhancement: Integration with a lighting display to highlight the location of specific bottles in your bar.

## Installation
To set up the SmartBarLighting application locally, follow these steps:

### Clone the Repository:
```git clone https://github.com/danielsickels/SmartBarLighting.git```
```cd SmartBarLighting```
### Set Up the Environment:
Ensure you have Docker installed on your system.
Run the local development script to build and start the application:
```bash ./local-dev.sh```
### Access the Application:
Once running, access the application via ```http://localhost:8000``` in your web browser.  
  
## Usage
**Fetch All Bottlews**: Navigate to the "Fetch All Bottles" section to see all current bottles in your database.
**Add Bottle**: Navigate to "Add Bottle" section to add new entries to your collection. Fill in the details and save.
**Fetch All Recipes**: Navigate to the "Fetch All Recipes" section to see all current Recipes in your database. If highlighted in green, that means you have the necessary spirit to create the recipe If highlihgted in red, that means you are missing the necessary spirit to create that recipe.
**Add Recipe**: In the "Add Recipe" section, input your favorite cocktail recipes with all necessary details.
**Searching**: Utilize the search functionality to quickly find bottles or recipes in your database.  
  
## Future Plans
The next phase of development aims to integrate a lighting system that will:
Illuminate specific bottles upon selection, making them easier to locate in your bar setup.
Provide visual cues for cocktail preparation by highlighting required bottles.
