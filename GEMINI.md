# GEMINI.md

## Project Overview
This project is an **Interactive Trivia Quiz Game** designed for the web. It features a retro arcade aesthetic (8-bit pixel art) and focuses on providing an engaging educational experience across four categories: Korean History, Science, Geography, and General Knowledge.

- **Platform**: Web Browser (Client-side only)
- **Tech Stack**: React, JavaScript/TypeScript, CSS3
- **Design Theme**: Retro & Pixel Arcade (Dot graphics, pixel fonts)
- **Key Features**:
    - 4-choice multiple-choice questions (40 total, 10 per category).
    - Arcade mechanics: 15-second time limit per question, Life/Heart system (3 lives), Combo multipliers, and Items (50:50, Time Extension, Hint).
    - Local ranking system using `LocalStorage`.
    - Static content management via `questions.json`.

## Building and Running
As the project is currently in the initial design phase, the following commands are standard for the intended React stack:

- **Install Dependencies**: `npm install` (TODO: Confirm once package.json is created)
- **Run Development Server**: `npm start` (TODO: Confirm once scripts are defined)
- **Build for Production**: `npm run build` (TODO: Confirm once scripts are defined)
- **Test**: `npm test` (TODO: Define testing strategy)

## Development Conventions
- **State Management**: Use React's built-in state management or hooks for handling score, lives, combos, and items.
- **Data Persistence**: Use `LocalStorage` for saving user rankings and high scores. No backend server is required.
- **Styling**: Adhere to the retro/arcade theme using pixel fonts and CSS3 animations. Ensure 60FPS performance for animations.
- **Content**: All quiz questions must be stored in `src/data/questions.json` (suggested path) following the schema defined in `prd.md`.
- **Responsive Design**: The UI must be optimized for both desktop and mobile browsers.

## Key Files
- `prd.md`: Comprehensive Product Requirements Document defining the game's scope, mechanics, and UI/UX.
- `questions.json`: (To be created) The source of truth for all quiz content.
